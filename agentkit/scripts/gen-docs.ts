import fs from 'fs/promises';
import path from 'path';

interface FunctionDefinition {
  name: string;
  description?: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

async function generateDocs() {
  const functionsDir = path.join(__dirname, '../src/functions');
  const docsDir = path.join(__dirname, '../docs');
  
  // Ensure docs directory exists
  await fs.mkdir(docsDir, { recursive: true });
  
  const functions = await fs.readdir(functionsDir);
  let markdown = `# 1inch Agent Kit - Function Reference

This document is auto-generated from the function schemas.

## Available Functions

`;

  for (const funcName of functions) {
    const funcDir = path.join(functionsDir, funcName);
    const stat = await fs.stat(funcDir);
    
    if (!stat.isDirectory()) continue;
    
    const schemaPath = path.join(funcDir, 'schema.json');
    const readmePath = path.join(funcDir, 'README.md');
    
    try {
      const schemaContent = await fs.readFile(schemaPath, 'utf-8');
      const schema: FunctionDefinition = JSON.parse(schemaContent);
      
      markdown += `## ${schema.name}\n\n`;
      markdown += `${schema.description || 'No description available.'}\n\n`;
      
      // Add parameters table
      if (schema.parameters.properties && Object.keys(schema.parameters.properties).length > 0) {
        markdown += `### Parameters\n\n`;
        markdown += `| Parameter | Type | Required | Description |\n`;
        markdown += `|-----------|------|----------|-------------|\n`;
        
        for (const [paramName, paramDef] of Object.entries(schema.parameters.properties)) {
          const isRequired = schema.parameters.required?.includes(paramName) || false;
          const type = paramDef.type || 'unknown';
          const description = paramDef.description || 'No description';
          
          markdown += `| ${paramName} | ${type} | ${isRequired ? 'Yes' : 'No'} | ${description} |\n`;
        }
        markdown += '\n';
      }
      
      // Add README content if available
      try {
        const readmeContent = await fs.readFile(readmePath, 'utf-8');
        markdown += `### Documentation\n\n`;
        markdown += readmeContent + '\n\n';
      } catch (error) {
        // README not found, skip
      }
      
      markdown += '---\n\n';
      
    } catch (error) {
      console.error(`Error processing function ${funcName}:`, error);
    }
  }
  
  // Write the generated documentation
  const outputPath = path.join(docsDir, 'function-reference.md');
  await fs.writeFile(outputPath, markdown);
  
  console.log(`✅ Documentation generated: ${outputPath}`);
}

generateDocs().catch(console.error); 