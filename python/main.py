import os

from codedx_api import CodeDxAPI
from dotenv import load_dotenv

def batch(iterable, n=1):
    l = len(iterable)
    for ndx in range(0, l, n):
        yield iterable[ndx:min(ndx + n, l)]

def get_data(bottom_value, retry = 0):
    try:
        cpe_response = requests.get(f"{base_url}{cpe_version}?resultsPerPage={results_per_page}&startIndex={bottom_value}&includeDeprecated={include_deprecated}&addOns={add_ons}")
        # Implement Try / Catch here to retry
        content = cpe_response.json()['result']['cpes']
        content_str = ','.join(map(json.dumps, content))
        return content_str
    except (http.client.IncompleteRead) as e:
        print(f"ERROR: Retry #{retry} with message {e} ")
        retry = retry + 1
        if(retry > 5):
            raise Exception("Max Retries")
        return get_data(bottom_value, retry)
    except Exception as e:
        print(f"ERROR: {e}")
        print(cpe_response.content)

def main():
    filename_export = os.getenv('filename_export')
    codedx_base_url = os.getenv('codedx_base_url')
    codedx_api_key = os.getenv('codedx_api_key')
    archer_username = os.getenv('archer_username')
    archer_password = os.getenv('archer_password')

    cdx = CodeDxAPI.CodeDx(codedx_base_url, codedx_api_key)
    # # {"projects": [{'id': 123, 'name': 'some name'}]}
    # projects = cdx.get_projects()
    # analysis = cdx.get_xml(projects['projects'][0]['id'])
    # print(analysis)
    
    cdx.job_result('67051965-d417-4143-a3b3-f889899bf49b', accept='')


    # with open(filename, 'w+') as file:

    #     # Make a call to retrieve the total number of CPEs
    #     response = requests.get(f"{base_url}{cpe_version}?resultsPerPage=1&includeDeprecated={include_deprecated}&addOns={add_ons}")
    #     total_results = int(response.json()['totalResults'])
    #     print(f"Total Results: {total_results}")

    #     for x in batch(range(0, total_results), n=int(results_per_page)):
    #         bottom_value = min(x)
    #         top_value = max(x)

    #         print(f"Gathering chunk from {bottom_value}-{top_value}")
    #         content_str = get_data(bottom_value)

    #         file.write(content_str)
    #         if(top_value != (total_results - 1)):
    #             file.write(',')

    #     file.write(']')

if __name__ == '__main__':
    load_dotenv()
    main()