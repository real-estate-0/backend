- directory structure
  config: application configuration
  src - validations: data validation - controllers - routers
  -v1
  -v2 - services - query - middlewares - docs - models - utils

  tests: integrate test


# API Development guide
 
1. define api path in router
2. define validation schema validation
   .apply validation to api path
3. define api controller in controllers
   .apply controller to router
4. define controller business logic using service
5. define service about resource( User, Topic, ...)
  .service layer should not direct connect respoitory
  .repository only connect by model
6. define unittest api 
7. define integration test in tests directory 

