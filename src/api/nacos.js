import axios from "axios"

export function fetchServiceList() {
    return axios.get('http://localhost:8848/nacos/v1/ns/catalog/services?hasIpCount=false&withInstances=false&pageNo=1&pageSize=10&serviceNameParam=&groupNameParam=&namespaceId=')
}


