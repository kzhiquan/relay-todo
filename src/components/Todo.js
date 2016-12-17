import classNames from 'classnames';
import React from 'react';
import Relay from 'react-relay';

import ChangeTodoStatusMutation from '../mutations/ChangeTodoStatusMutation';
import RemoveTodoMutation from '../mutations/RemoveTodoMutation';
import RenameTodoMutation from '../mutations/RenameTodoMutation';
import TodoTextInput from './TodoTextInput';

class Todo extends React.Component {
  static propTypes = {
    viewer: React.PropTypes.object.isRequired,
    todo: React.PropTypes.object.isRequired,
    relay: React.PropTypes.object.isRequired,
  };

  constructor(props, context) {
    super(props, context);

    this.state = {
      isEditing: false,
    };
  }

  onCompleteChange = (e) => {
    const { relay, viewer, todo } = this.props;
    const complete = e.target.checked;

    relay.commitUpdate(
      new ChangeTodoStatusMutation({ viewer, todo, complete })
    );
  };

  onDestroyClick = () => {
    this.removeTodo();
  };

  onLabelDoubleClick = () => {
    this.setEditMode(true);
  };

  onTextInputCancel = () => {
    this.setEditMode(false);
  };

  onTextInputDelete = () => {
    this.setEditMode(false);
    this.removeTodo();
  };

  onTextInputSave = (text) => {
    const { relay, todo } = this.props;

    this.setEditMode(false);

    relay.commitUpdate(
      new RenameTodoMutation({ todo, text })
    );
  };

  setEditMode(isEditing) {
    this.setState({ isEditing });
  }

  removeTodo() {
    const { relay, viewer, todo } = this.props;

    relay.commitUpdate(
      new RemoveTodoMutation({ viewer, todo })
    );
  }

  renderTextInput() {
    if (!this.state.isEditing) {
      return null;
    }

    return (
      <TodoTextInput
        className="edit"
        commitOnBlur
        initialValue={this.props.todo.text}
        onCancel={this.onTextInputCancel}
        onDelete={this.onTextInputDelete}
        onSave={this.onTextInputSave}
      />
    );
  }

  render() {
    const { complete, text } = this.props.todo;
    const { isEditing } = this.state;

    return (
      <li
        className={classNames({
          completed: complete,
          editing: isEditing,
        })}
      >
        <div className="view">
          <input
            type="checkbox"
            checked={complete}
            className="toggle"
            onChange={this.onCompleteChange}
          />
          <label onDoubleClick={this.onLabelDoubleClick}>
            {text}
          </label>
          <button
            className="destroy"
            onClick={this.onDestroyClick}
          />
        </div>

        {this.renderTextInput()}
      </li>
    );
  }
}

export default Relay.createContainer(Todo, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on User {
        ${ChangeTodoStatusMutation.getFragment('viewer')}
        ${RemoveTodoMutation.getFragment('viewer')}
      }
    `,
    todo: () => Relay.QL`
      fragment on Todo {
        complete
        id
        text
        ${ChangeTodoStatusMutation.getFragment('todo')}
        ${RemoveTodoMutation.getFragment('todo')}
        ${RenameTodoMutation.getFragment('todo')}
      }
    `,
  },
});
