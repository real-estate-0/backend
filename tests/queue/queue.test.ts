import { io } from "socket.io-client";
import AppServer from '../../src/server';
import httpStatus from 'http-status';
import request from "supertest";
import faker from"faker";
import QueueService from '../../src/services/queue.service';

import { expect } from "chai";

describe("queue.service.ts", ()=>{
  const fakeTopic: ITopic = {
    topicName: faker.company.companyName(),
    topicDescription: faker.company.catchPhrase(),
    createUserObjectId: faker.name.firstName(),
    password: "4567",
  };
  const fakeGroup: IGroup = {
    groupName: faker.company.companyName(),
    groupDescription: faker.company.catchPhrase(),
  };
	before(() =>{
		QueueService.truncateQueue('main');
	})

	it('queue create task push, and pop process', async ()=>{
		const taskInfo= QueueService.createTask(fakeTopic,'create_topic', {});
    expect(taskInfo).to.have.keys('data', 'args', 'taskId', 'action')
		const pushResult = await QueueService.pushQueue('main', taskInfo);
    expect(pushResult).to.be.true;
		const popResult= await QueueService.popQueue('main', 1000);
    expect(popResult).to.have.keys('data', 'args', 'taskId', 'action')
    expect(popResult['action']).to.eq('create_topic', 'its not my task')
	})

	it('queue create task push, and pop process with twice', async ()=>{
		const taskInfo_topic= QueueService.createTask(fakeTopic,'create_topic', {});
		const taskInfo_topic2= QueueService.createTask(fakeTopic,'delete_topic', {});
    expect(taskInfo_topic).to.have.keys('data', 'args', 'taskId', 'action')
    expect(taskInfo_topic2).to.have.keys('data', 'args', 'taskId', 'action')

		const pushResult_topic = await QueueService.pushQueue('main', taskInfo_topic);
    console.log('pushResult_topic', pushResult_topic);
		const pushResult_topic2 = await QueueService.pushQueue('main', taskInfo_topic2);
    console.log('pushResult_topic2', pushResult_topic2);

    expect(pushResult_topic).to.be.true;
    expect(pushResult_topic2).to.be.true;

		const popResult_topic= await QueueService.popQueue('main', 1000);
    console.log('popResult_topic', popResult_topic);
    expect(popResult_topic).to.have.keys('data', 'args', 'taskId', 'action')
    expect(popResult_topic['action']).to.eq('create_topic', 'its not my task')

    const popResult_topic2= await QueueService.popQueue('main', 1000);
    console.log('popResult_group', popResult_topic2);
    expect(popResult_topic2).to.have.keys('data', 'args', 'taskId', 'action')
    expect(popResult_topic2['action']).to.eq('delete_topic', 'its not my task')
	})

	after(()=>{
	})
})

