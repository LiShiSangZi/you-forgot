import { observable, computed } from 'mobx';
import EventEmitter from 'eventemitter2';

const itemKeys = '__tasks';

const timestamp = new Date().setHours(0, 0, 0, 0);
const sourceTimeStamp = Number.parseInt(localStorage.getItem('__timestamp'));

const dayChanged = timestamp !== sourceTimeStamp;
localStorage.setItem('__timestamp', timestamp);

class DataChangeEmitter extends EventEmitter {
  static ON_DATA_CHANGE = 'onDataChange';
  static ON_CHANGE_TODO = 'onChangeTodo';
}

export class Content {
  @observable done = false;
  constructor(order, emitter, done) {
    this.order = order;
    this.emitter = emitter;
    if (typeof done !== 'undefined') {
      this.done = done;
    }
  }
  toggleDone() {
    this.done = !this.done;
    this.emitter.emit(DataChangeEmitter.ON_DATA_CHANGE);
  }
  toJSON() {
    return {
      done: this.done,
      order: this.order
    };
  }
}

export class Todo {
  id = Math.random();
  @observable time = 1;
  @observable label = '';
  @observable finished = false;
  @observable subTask = [];
  constructor(emitter, o, init) {
    const { time, label } = o;
    this.time = time;
    this.label = label;
    this.emitter = emitter;
    if (!dayChanged && !init) {
      o.subTask.forEach(t =>
        this.subTask.push(new Content(t.order, emitter, t.done))
      );
    } else {
      for (let i = 0; i < this.time; i++) {
        this.subTask.push(new Content(i, emitter));
      }
    }
  }
  toJSON() {
    return {
      finished: this.finished,
      time: this.time,
      label: this.label,
      subTask: this.subTask
    };
  }
  select() {
    this.emitter.emit(DataChangeEmitter.ON_CHANGE_TODO, this);
  }
}

export class TodoList {
  @observable todos = [];
  @observable.ref activeTodo = null;
  constructor() {
    this.emitter = new DataChangeEmitter();
    this.loadData();
    if (this.todos.length > 0) {
      this.activeTodo = this.todos[0];
    }
    this.emitter.on(DataChangeEmitter.ON_DATA_CHANGE, () => this.commitData());
    this.emitter.on(DataChangeEmitter.ON_CHANGE_TODO, todo =>
      this.selectTodo(todo)
    );
  }
  createTask(label, time) {
    this.todos.push(new Todo(this.emitter, { label, time }, true));
    this.commitData();
  }
  commitData() {
    localStorage.setItem(itemKeys, JSON.stringify(this.todos));
  }
  loadData() {
    const todoJSON = localStorage.getItem(itemKeys);
    if (!todoJSON) {
      return;
    }
    const todoObj = JSON.parse(todoJSON);
    todoObj.forEach(o => this.todos.push(new Todo(this.emitter, o)));
  }
  selectTodo(todo) {
    this.activeTodo = todo;
  }
}
