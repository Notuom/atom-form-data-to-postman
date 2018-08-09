'use babel';

import { CompositeDisposable } from 'atom';

export default {

  subscriptions: null,

  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that converts data in the file
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'form-data-to-postman:convert': () => this.convert()
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  serialize() {
    return {};
  },

  convert() {
    const buffer = atom.workspace.getActiveTextEditor().getBuffer();
    const boundary = buffer.lineForRow(0);
    const fieldChunks = buffer.getText().split(boundary);

    const regex = /Content-Disposition: form-data; name="(.*)"/;

    buffer.transact(() => {
      buffer.setText('');
      fieldChunks.forEach(fieldChunk => {
        let match;
        if ((match = regex.exec(fieldChunk)) !== null && match.length > 1) {
          const fieldName = match[1];
          const fieldValue = fieldChunk.split(match[0])[1].trim();
          buffer.append(`${fieldName}:${fieldValue}\n`);
        }
      });
    });
  }

};
