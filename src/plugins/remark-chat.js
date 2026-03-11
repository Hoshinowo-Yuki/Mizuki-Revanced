import { visit } from 'unist-util-visit';

export function remarkChat() {
  console.log('=== remarkChat LOADED ===');
  
  return (tree) => {
    console.log('=== remarkChat RUNNING ===');
    
    visit(tree, (node) => {
      if (node.type === 'containerDirective') {
        console.log('Found directive:', node.name);
      }
    });
  };
}

export default remarkChat;