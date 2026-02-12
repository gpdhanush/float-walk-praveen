process.env.NODE_ENV = 'test';

if (!process.env.MYSQL_DATABASE) {
  process.env.MYSQL_DATABASE = 'styleflow_retail_test';
}
