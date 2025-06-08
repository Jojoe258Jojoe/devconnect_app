import React, { useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';

interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
  shape?: 'rect' | 'diamond' | 'circle';
  type?: 'start' | 'process' | 'decision' | 'end';
}

interface Edge {
  from: string;
  to: string;
}

interface D3CanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (nodes: Node[]) => void;
  onEdgesChange: (edges: Edge[]) => void;
  selectedTool: string;
  width?: number;
  height?: number;
}

const D3Canvas: React.FC<D3CanvasProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  selectedTool,
  width = 800,
  height = 600
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const getNodeColor = (node: Node) => {
    switch (node.type) {
      case 'start':
      case 'end':
        return { fill: '#22c55e', stroke: '#16a34a' };
      case 'process':
        return { fill: '#3b82f6', stroke: '#2563eb' };
      case 'decision':
        return { fill: '#eab308', stroke: '#ca8a04' };
      default:
        return { fill: '#6b7280', stroke: '#4b5563' };
    }
  };

  const drawNode = (nodeGroup: any, node: Node) => {
    const colors = getNodeColor(node);
    
    if (node.shape === 'diamond' || node.type === 'decision') {
      // Diamond shape for decision nodes
      nodeGroup.append('polygon')
        .attr('points', '50,0 100,20 50,40 0,20')
        .attr('fill', colors.fill)
        .attr('stroke', colors.stroke)
        .attr('stroke-width', 2);
    } else if (node.shape === 'circle' || node.type === 'start' || node.type === 'end') {
      // Circle for start/end nodes
      nodeGroup.append('circle')
        .attr('cx', 50)
        .attr('cy', 20)
        .attr('r', 25)
        .attr('fill', colors.fill)
        .attr('stroke', colors.stroke)
        .attr('stroke-width', 2);
    } else {
      // Rectangle for process nodes
      nodeGroup.append('rect')
        .attr('width', 100)
        .attr('height', 40)
        .attr('rx', 5)
        .attr('fill', colors.fill)
        .attr('stroke', colors.stroke)
        .attr('stroke-width', 2);
    }

    // Add text
    nodeGroup.append('text')
      .attr('x', 50)
      .attr('y', 25)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', 'white')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text(node.label);
  };

  const handleCanvasClick = useCallback((event: MouseEvent) => {
    if (selectedTool === 'select') return;

    const svg = svgRef.current;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const x = event.clientX - rect.left - 50;
    const y = event.clientY - rect.top - 20;

    const newNode: Node = {
      id: generateId(),
      label: selectedTool === 'start' ? 'Start' :
             selectedTool === 'end' ? 'End' :
             selectedTool === 'process' ? 'Process' :
             selectedTool === 'decision' ? 'Decision?' :
             'Node',
      x,
      y,
      type: selectedTool as any,
      shape: selectedTool === 'decision' ? 'diamond' :
             selectedTool === 'start' || selectedTool === 'end' ? 'circle' :
             'rect'
    };

    onNodesChange([...nodes, newNode]);
  }, [selectedTool, nodes, onNodesChange]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    if (!svg.node()) return;

    // Clear previous content
    svg.selectAll('*').remove();

    // Add background
    svg.append('rect')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('fill', '#0f172a')
      .on('click', (event) => {
        if (selectedTool !== 'select') {
          handleCanvasClick(event);
        }
      });

    // Add grid pattern
    const defs = svg.append('defs');
    const pattern = defs.append('pattern')
      .attr('id', 'grid')
      .attr('width', 20)
      .attr('height', 20)
      .attr('patternUnits', 'userSpaceOnUse');

    pattern.append('path')
      .attr('d', 'M 20 0 L 0 0 0 20')
      .attr('fill', 'none')
      .attr('stroke', '#374151')
      .attr('stroke-width', 1)
      .attr('opacity', 0.3);

    svg.append('rect')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('fill', 'url(#grid)');

    // Draw edges first (so they appear behind nodes)
    const edgeGroup = svg.append('g').attr('class', 'edges');
    
    edgeGroup.selectAll('.edge')
      .data(edges)
      .enter()
      .append('line')
      .attr('class', 'edge')
      .attr('x1', (d) => {
        const fromNode = nodes.find(n => n.id === d.from);
        return fromNode ? fromNode.x + 50 : 0;
      })
      .attr('y1', (d) => {
        const fromNode = nodes.find(n => n.id === d.from);
        return fromNode ? fromNode.y + 40 : 0;
      })
      .attr('x2', (d) => {
        const toNode = nodes.find(n => n.id === d.to);
        return toNode ? toNode.x + 50 : 0;
      })
      .attr('y2', (d) => {
        const toNode = nodes.find(n => n.id === d.to);
        return toNode ? toNode.y : 0;
      })
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#arrowhead)');

    // Add arrowhead marker
    defs.append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 8)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#3b82f6');

    // Draw nodes
    const nodeGroup = svg.selectAll('.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d) => `translate(${d.x},${d.y})`)
      .style('cursor', 'move')
      .call(
        d3.drag<SVGGElement, Node>()
          .on('start', function(event, d) {
            d3.select(this).raise();
          })
          .on('drag', function(event, d) {
            d.x = event.x;
            d.y = event.y;
            d3.select(this).attr('transform', `translate(${d.x},${d.y})`);
            
            // Update edges in real-time
            edgeGroup.selectAll('.edge')
              .attr('x1', (edge: any) => {
                const fromNode = nodes.find(n => n.id === edge.from);
                return fromNode ? fromNode.x + 50 : 0;
              })
              .attr('y1', (edge: any) => {
                const fromNode = nodes.find(n => n.id === edge.from);
                return fromNode ? fromNode.y + 40 : 0;
              })
              .attr('x2', (edge: any) => {
                const toNode = nodes.find(n => n.id === edge.to);
                return toNode ? toNode.x + 50 : 0;
              })
              .attr('y2', (edge: any) => {
                const toNode = nodes.find(n => n.id === edge.to);
                return toNode ? toNode.y : 0;
              });
          })
          .on('end', function(event, d) {
            // Update the nodes array with new positions
            const updatedNodes = nodes.map(node => 
              node.id === d.id ? { ...node, x: d.x, y: d.y } : node
            );
            onNodesChange(updatedNodes);
          })
      );

    // Draw each node
    nodeGroup.each(function(d) {
      drawNode(d3.select(this), d);
    });

    // Add double-click to edit text
    nodeGroup.on('dblclick', function(event, d) {
      event.stopPropagation();
      const newLabel = prompt('Enter new label:', d.label);
      if (newLabel && newLabel.trim()) {
        const updatedNodes = nodes.map(node => 
          node.id === d.id ? { ...node, label: newLabel.trim() } : node
        );
        onNodesChange(updatedNodes);
      }
    });

    // Add right-click context menu for connections
    nodeGroup.on('contextmenu', function(event, d) {
      event.preventDefault();
      const fromNodeId = d.id;
      const targetNodeId = prompt('Enter target node ID to connect to:');
      
      if (targetNodeId && nodes.find(n => n.id === targetNodeId)) {
        const newEdge: Edge = { from: fromNodeId, to: targetNodeId };
        onEdgesChange([...edges, newEdge]);
      }
    });

  }, [nodes, edges, selectedTool, handleCanvasClick, onNodesChange, onEdgesChange]);

  return (
    <div ref={containerRef} className="w-full h-full bg-dark-900 rounded-lg overflow-hidden">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="w-full h-full"
      />
    </div>
  );
};

export default D3Canvas;