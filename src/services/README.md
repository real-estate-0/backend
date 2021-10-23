## Roles
 - if resource model exists than service should be create 
  
## service method return

- GET
  return resource or list of resource
  subresource return only id list
  if you want detail subresoure information using get method

- DELETE
  return resource or NOT_FOUND

- UPDATE
  update only service to specific field
  not provide dynamic update(depend on data)
  return resouece or NOT_FOUND
- CREATE
  return objectId

Delete, update operation on subresource is going to return parent resource

