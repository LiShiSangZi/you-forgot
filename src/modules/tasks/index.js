import React, { Component } from 'react';

import { observable, computed } from 'mobx';
import { observer } from 'mobx-react';

import { TodoList } from './model';

import style from './style.less';

import { Button, Checkbox, Layout, List, Menu } from 'antd';
const { Footer, Sider, Content } = Layout;

const store = new TodoList();

const TodoView = observer(({ todo }) => (
  <List.Item>
    <a onClick={() => todo.select()}>{todo.label}</a>
  </List.Item>
));
const MenuView = observer(({ todo }) => (
  <Menu.Item key={todo.id}>
    <a onClick={() => todo.select()}>{todo.label}</a>
  </Menu.Item>
));

const DetailItem = observer(({ sub }) => {
  return (
    <List.Item>
      <Checkbox
        className={style.checkbox}
        key={sub.order}
        checked={sub.done}
        onChange={() => sub.toggleDone()}
      >
        {sub.order}
      </Checkbox>
    </List.Item>
  );
});

@observer
class Tasks extends Component {
  onCreateTask() {
    const title = prompt('请输入任务名:');
    let time = Number.parseInt(prompt('请输入次数:'));
    while (!Number.isInteger(time)) {
      time = Number.parseInt(prompt('请输入次数:'));
    }
    if (!!title && !!time) {
      store.createTask(title, Number.parseInt(time));
    }
  }
  toggleSelected(sub) {
    sub.done = !sub.done;
  }
  renderTaskDetail(props) {
    const { activeTodo } = props.todoList;
    if (props.todoList.activeTodo) {
      return (
        <List
          bordered
          dataSource={activeTodo.subTask}
          renderItem={sub => <DetailItem sub={sub} />}
        />
      );
    }
  }
  render() {
    const { props } = this;
    const { todoList } = props;
    const keys = [];
    if (todoList.todos.length > 0) {
      keys.push('' + todoList.todos[0].id);
    }
    return (
      <Layout>
        <Sider>
          <div className={style.sider}>
            <Menu
              defaultSelectedKeys={keys}
              className={style.menu}
              onClick={m => m.item.props.todo.select()}
              mode="inline"
              theme="dark"
            >
              {todoList.todos.map(todo => (
                <Menu.Item key={todo.id} todo={todo}>
                  {todo.label}
                </Menu.Item>
              ))}
            </Menu>
            <Footer className={style.footer}>
              <Button onClick={() => this.onCreateTask()}>创建任务</Button>
            </Footer>
          </div>
        </Sider>
        <Layout>
          <Content>{this.renderTaskDetail(props)}</Content>
        </Layout>
      </Layout>
    );
  }
}
export default () => <Tasks todoList={store} />;
