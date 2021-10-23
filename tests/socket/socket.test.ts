import { io } from "socket.io-client";
import AppServer from '../../src/server';
import httpStatus from 'http-status';
import request from "supertest";

import { expect } from "chai";

describe("socket.ts", ()=>{
	const URL = "http://localhost:2000";
	let clientSocket;

	before(() =>{
		clientSocket =  io(URL, {
			transports: ["websocket"],
			extraHeaders: { "tokens": "1234" }
		});
		console.log('socket init');
	})

	it('socket send test', (done)=>{
		const app = new AppServer();
		app.run();
		clientSocket.on('greet', (data)=>{
			console.log('greet', data);
			expect(data).to.have.all.keys('message')
			done()
		})
		clientSocket.auth = { userObjectId: 'userObjectId1'}
		clientSocket.emit('message', { message: 'hello bro', field: 'a' });
		console.log('socket emit message');
	})
	it('worker message test', async () =>{
		/*
		clientSocket.on('test', (data)=>{
			expect(data).to.have.keys('data')
			done()
		})
		*/
		//await request(app).get('/').send({sendType:'broadcast', data:{test:1}, target:"test" }).expect(httpStatus.OK)
		const app = new AppServer().getApp();
		await request(app).post('/worker/message').send({sendType:'broadcast', data:{test:1}, target:"test" }).expect(httpStatus.ACCEPTED)
	})

	after(()=>{
		clientSocket.close()
	})
})

