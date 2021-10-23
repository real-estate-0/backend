import config from 'config';
import http from 'http';
import httpProxy from 'http-proxy';

const gatewayConfig = config.get('gateway');

let proxy = httpProxy.createProxyServer({});
console.log('gateway', gatewayConfig);

proxy.on('proxyReq', (proxyReq, req, res, options)=>{
  //TODO setHeader req addres ip
  proxyReq.setHeader('X-Forwared-For', 'foobar');
})

let server = http.createServer((req, res)=>{
  //split target by request path
  proxy.web(req, res, { target: 'http://127.0.0.1:2000'});
})

proxy.on('error', function(e){
  console.log('e')
});



server.listen(5050);

