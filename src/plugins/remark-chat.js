import { visit } from 'unist-util-visit';

export function remarkChat() {
  return (tree) => {
    visit(tree, 'containerDirective', (node) => {
      if (node.name !== 'chat') return;

      let debug = '<pre style="background:#ffe;padding:10px;font-size:12px;overflow:auto;">';
      debug += 'Children: ' + (node.children?.length || 0) + '\n';
      
      node.children?.forEach((child, i) => {
        debug += `\n[${i}] type: ${child.type}\n`;
        if (child.children) {
          child.children.forEach((c, j) => {
            const val = c.value ? c.value.substring(0, 100).replace(/</g, '&lt;') : '(no value)';
            debug += `  [${i}.${j}] ${c.type}: ${val}\n`;
          });
        }
      });
      
      debug += '</pre>';

      node.type = 'html';
      node.value = debug;
      node.children = [];
    });
  };
}

export default remarkChat;