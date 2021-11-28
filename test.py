"""
import requests

url = 'http://apis.data.go.kr/1741000/StanReginCd/getStanReginCdList'
params ={'serviceKey' : 'UQoQhO/CpOPm65pe+obx1jBuKFhT+2tXx2jIFwwsrkp5Q/TfZw8hYAv3j4hSN+n0Cs35+6ZeuKGGGb07pX+qCg==', 
            'pageNo' : '1', 
            'numOfRows' : '3', 
            'type' : 'json', 
            'locatadd_nm' : '문정동' 
        }

response = requests.get(url, params=params)
print(response.content)
"""

"""
import requests

url = 'http://apis.data.go.kr/1611000/nsdi/ReferLandPriceService/attr/getReferLandPriceAttr'
params ={'serviceKey' : 'UQoQhO/CpOPm65pe+obx1jBuKFhT+2tXx2jIFwwsrkp5Q/TfZw8hYAv3j4hSN+n0Cs35+6ZeuKGGGb07pX+qCg==', 
'ldCode' : '1111017400', 'stdrYear' : '2021', 'format' : 'json', 'numOfRows' : '10', 'pageNo' : '1' }

response = requests.get(url, params=params)
print(response.content)
"""

"""
import requests

url = 'http://apis.data.go.kr/1611000/nsdi/LandUseService/attr/getLandUseAttr'
params ={'serviceKey' : 'UQoQhO/CpOPm65pe+obx1jBuKFhT+2tXx2jIFwwsrkp5Q/TfZw8hYAv3j4hSN+n0Cs35+6ZeuKGGGb07pX+qCg==', 'pnu' : '111101010010008', 'cnflcAt' : '1', 'prposAreaDstrcCodeNm' : '상대보호구역', 'format' : 'json', 'numOfRows' : '10', 'pageNo' : '1' }

response = requests.get(url, params=params)
print(response.content)
"""

import requests

url = 'http://apis.data.go.kr/1611000/nsdi/IndvdLandPriceService/attr/getIndvdLandPriceAttr'
params ={'serviceKey' : 'UQoQhO/CpOPm65pe+obx1jBuKFhT+2tXx2jIFwwsrkp5Q/TfZw8hYAv3j4hSN+n0Cs35+6ZeuKGGGb07pX+qCg==', 'pnu' : '1111017700102110000', 'stdrYear' : '2021', 'format' : 'json', 'numOfRows' : '10', 'pageNo' : '1' }

response = requests.get(url, params=params)
print(response.headers)
print(response.request.headers)
