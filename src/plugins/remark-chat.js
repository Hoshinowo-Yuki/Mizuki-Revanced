import { visit } from 'unist-util-visit';

export function remarkChat() {
  return (tree) => {
    let found = [];
    
    visit(tree, (node) => {
      if (node.name) {
        found.push(node.name + ':' + node.type);
      }
    });
    
    // 在 tree 最前面加 debug 資訊
    tree.children.unshift({
      type: 'html',
      value: `<pre style="background:#fef;padding:10px;">All directives found: ${found.join(', ') || 'NONE'}</pre>`
    });
  };
}

export default remarkChat;