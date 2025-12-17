import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import type { AnimationStep, CellPosition } from '../types';
import { getLCSAtCell } from '../core/lcs';
import './DPTable.css';

interface DPTableProps {
  text1: string;
  text2: string;
  dpTable: number[][];
  currentStep: AnimationStep | null;
  backtrackPath: CellPosition[];
  backtrackMatchCells: CellPosition[];
}

interface TooltipState {
  visible: boolean;
  cellX: number;  // 格子中心的X坐标（相对于SVG）
  cellY: number;  // 格子中心的Y坐标（相对于SVG）
  row: number;
  col: number;
  value: number;
  lcs: string;
  text1Indices: number[];
  text2Indices: number[];
}

const BASE_CELL_SIZE = 60;
const BASE_HEADER_SIZE = 50;

export function DPTable({
  text1,
  text2,
  dpTable,
  currentStep,
  backtrackPath,
  backtrackMatchCells,
}: DPTableProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    cellX: 0,
    cellY: 0,
    row: 0,
    col: 0,
    value: 0,
    lcs: '',
    text1Indices: [],
    text2Indices: [],
  });

  // 计算缩放比例以适应容器
  useEffect(() => {
    if (!containerRef.current || dpTable.length === 0) return;

    const updateScale = () => {
      const container = containerRef.current;
      if (!container) return;

      const rows = dpTable.length;
      const cols = dpTable[0].length;
      const tableWidth = BASE_HEADER_SIZE + cols * BASE_CELL_SIZE + 20;
      const tableHeight = BASE_HEADER_SIZE + rows * BASE_CELL_SIZE + 20;

      // 留出图例的空间（约50px）和一些padding
      const availableWidth = container.clientWidth - 40;
      const availableHeight = container.clientHeight - 80;

      const scaleX = availableWidth / tableWidth;
      const scaleY = availableHeight / tableHeight;
      
      // 取较小的缩放比例，确保表格完全可见，但不超过1.5倍
      const newScale = Math.min(scaleX, scaleY, 1.5);
      setScale(Math.max(newScale, 0.5)); // 最小0.5倍
    };

    updateScale();
    
    const resizeObserver = new ResizeObserver(updateScale);
    resizeObserver.observe(containerRef.current);
    
    return () => resizeObserver.disconnect();
  }, [dpTable]);

  // 处理鼠标悬停 - 计算格子中心位置
  const handleCellHover = useCallback((
    row: number,
    col: number,
    value: number
  ) => {
    const { lcs, text1Indices, text2Indices } = getLCSAtCell(text1, text2, dpTable, row, col);
    
    // 获取SVG相对于容器的位置
    const svg = svgRef.current;
    const container = containerRef.current;
    if (!svg || !container) return;
    
    const svgRect = svg.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    // SVG在容器中的偏移
    const svgOffsetX = svgRect.left - containerRect.left;
    const svgOffsetY = svgRect.top - containerRect.top;
    
    // 计算格子中心位置（相对于容器）
    const cellX = svgOffsetX + (10 + BASE_HEADER_SIZE + col * BASE_CELL_SIZE + BASE_CELL_SIZE / 2) * scale;
    const cellY = svgOffsetY + (10 + BASE_HEADER_SIZE + row * BASE_CELL_SIZE + BASE_CELL_SIZE / 2) * scale;
    
    setTooltip({
      visible: true,
      cellX,
      cellY,
      row,
      col,
      value,
      lcs,
      text1Indices,
      text2Indices,
    });
  }, [text1, text2, dpTable, scale]);

  const handleCellLeave = useCallback(() => {
    setTooltip(prev => ({ ...prev, visible: false }));
  }, []);

  useEffect(() => {
    if (!svgRef.current || dpTable.length === 0) return;

    // 使用基础尺寸常量
    const CELL_SIZE = BASE_CELL_SIZE;
    const HEADER_SIZE = BASE_HEADER_SIZE;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const rows = dpTable.length;
    const cols = dpTable[0].length;
    const width = HEADER_SIZE + cols * CELL_SIZE + 20;
    const height = HEADER_SIZE + rows * CELL_SIZE + 20;

    // 使用viewBox保持内部坐标不变，通过width/height控制实际显示大小
    svg
      .attr('width', width * scale)
      .attr('height', height * scale)
      .attr('viewBox', `0 0 ${width} ${height}`);

    const g = svg.append('g').attr('transform', 'translate(10, 10)');
    
    // 定义箭头标记
    const defs = svg.append('defs');

    // 辅助函数
    const isInList = (list: CellPosition[], row: number, col: number) =>
      list.some(p => p.row === row && p.col === col);

    // 判断单元格是否应该显示值
    // 第一行和第一列始终显示（初始化为0）
    // 其他单元格：如果dpTable中有非零值，或者是当前步骤正在计算的单元格，则显示
    // 由于dpTable是当前步骤的快照，我们可以直接检查值是否已被计算
    const hasValue = (i: number, j: number) => {
      // 第一行和第一列始终显示
      if (i === 0 || j === 0) return true;
      
      // 如果没有当前步骤，不显示内部单元格
      if (!currentStep) return false;
      
      // 检查dpTable中的值：如果值不为0，说明已经被计算过
      // 或者如果值为0但是是当前正在计算的单元格，也显示
      const value = dpTable[i]?.[j];
      if (value !== undefined && value !== 0) return true;
      
      // 对于值为0的单元格，需要判断是否已经被计算过
      // 使用行优先顺序：如果当前步骤的codePhase是赋值相关的，
      // 则该单元格及之前的单元格都应该显示
      const codePhase = currentStep.codePhase;
      const isAssignPhase = codePhase === 'match-assign' || codePhase === 'mismatch-assign';
      
      if (isAssignPhase) {
        // 当前步骤正在赋值，显示到当前单元格
        return (i < currentStep.row) || (i === currentStep.row && j <= currentStep.col);
      }
      
      // 对于其他步骤（如loop-i, loop-j, compare），显示到上一个已计算的单元格
      // 通过检查dpTableSnapshot来确定
      // 由于dpTable就是快照，我们可以检查是否有任何非零值在该位置之后
      // 简化逻辑：如果当前步骤的row和col都大于0，说明正在处理某个单元格
      if (currentStep.row > 0 && currentStep.col > 0) {
        // 显示当前单元格之前的所有单元格
        return (i < currentStep.row) || (i === currentStep.row && j < currentStep.col);
      }
      
      // 对于初始化步骤，不显示内部单元格
      return false;
    };

    // 绘制列标题背景
    g.append('rect')
      .attr('x', HEADER_SIZE)
      .attr('y', 0)
      .attr('width', cols * CELL_SIZE)
      .attr('height', HEADER_SIZE)
      .attr('fill', '#e3f2fd');

    // 绘制行标题背景
    g.append('rect')
      .attr('x', 0)
      .attr('y', HEADER_SIZE)
      .attr('width', HEADER_SIZE)
      .attr('height', rows * CELL_SIZE)
      .attr('fill', '#e8f5e9');

    // 绘制角落
    g.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', HEADER_SIZE)
      .attr('height', HEADER_SIZE)
      .attr('fill', '#f5f5f5')
      .attr('stroke', '#ccc');

    // 绘制列标题 (text2字符 + 下标)
    for (let j = 0; j < cols; j++) {
      const x = HEADER_SIZE + j * CELL_SIZE;
      g.append('rect')
        .attr('x', x)
        .attr('y', 0)
        .attr('width', CELL_SIZE)
        .attr('height', HEADER_SIZE)
        .attr('fill', currentStep && j === currentStep.col ? '#bbdefb' : '#e3f2fd')
        .attr('stroke', '#90caf9');

      // 字符
      g.append('text')
        .attr('x', x + CELL_SIZE / 2)
        .attr('y', HEADER_SIZE / 2 - 8)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('font-size', '18px')
        .attr('font-weight', 'bold')
        .attr('font-family', 'monospace')
        .attr('fill', '#1565c0')
        .text(j === 0 ? 'ε' : text2[j - 1]);

      // 下标
      g.append('text')
        .attr('x', x + CELL_SIZE / 2)
        .attr('y', HEADER_SIZE / 2 + 14)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('font-size', '12px')
        .attr('font-weight', '500')
        .attr('font-family', 'monospace')
        .attr('fill', '#666')
        .text(j);
    }

    // 绘制行标题 (text1字符 + 下标)
    for (let i = 0; i < rows; i++) {
      const y = HEADER_SIZE + i * CELL_SIZE;
      g.append('rect')
        .attr('x', 0)
        .attr('y', y)
        .attr('width', HEADER_SIZE)
        .attr('height', CELL_SIZE)
        .attr('fill', currentStep && i === currentStep.row ? '#c8e6c9' : '#e8f5e9')
        .attr('stroke', '#a5d6a7');

      // 字符
      g.append('text')
        .attr('x', HEADER_SIZE / 2 - 8)
        .attr('y', y + CELL_SIZE / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('font-size', '18px')
        .attr('font-weight', 'bold')
        .attr('font-family', 'monospace')
        .attr('fill', '#2e7d32')
        .text(i === 0 ? 'ε' : text1[i - 1]);

      // 下标
      g.append('text')
        .attr('x', HEADER_SIZE / 2 + 12)
        .attr('y', y + CELL_SIZE / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('font-size', '12px')
        .attr('font-weight', '500')
        .attr('font-family', 'monospace')
        .attr('fill', '#666')
        .text(i);
    }

    // 绘制DP表格单元格
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const x = HEADER_SIZE + j * CELL_SIZE;
        const y = HEADER_SIZE + i * CELL_SIZE;
        const value = dpTable[i][j];
        const showValue = hasValue(i, j);

        // 确定单元格样式
        let fillColor = '#fff';
        let strokeColor = '#ddd';
        let strokeWidth = 1;

        if (backtrackMatchCells.length > 0 && isInList(backtrackMatchCells, i, j)) {
          fillColor = '#c8e6c9';
          strokeColor = '#4caf50';
          strokeWidth = 3;
        } else if (backtrackPath.length > 0 && isInList(backtrackPath, i, j)) {
          fillColor = '#e1bee7';
          strokeColor = '#9c27b0';
          strokeWidth = 2;
        } else if (currentStep && i === currentStep.row && j === currentStep.col) {
          fillColor = currentStep.transitionType === 'match' ? '#a5d6a7' : '#fff59d';
          strokeColor = currentStep.transitionType === 'match' ? '#2e7d32' : '#f9a825';
          strokeWidth = 4;
        } else if (currentStep && currentStep.comparisonInfo && isInList(currentStep.sourceCells, i, j)) {
          // 字符不匹配时，同时高亮上方和左方两个格子
          const { topCell, topValue, leftValue } = currentStep.comparisonInfo;
          const isTopCell = i === topCell.row && j === topCell.col;
          const isWinner = isTopCell ? topValue >= leftValue : leftValue > topValue;
          
          if (isWinner) {
            // 胜出的格子（较大值）用绿色
            fillColor = '#c8e6c9';
            strokeColor = '#2e7d32';
            strokeWidth = 3;
          } else {
            // 落败的格子（较小值）用红色
            fillColor = '#ffcdd2';
            strokeColor = '#c62828';
            strokeWidth = 2;
          }
        } else if (currentStep && isInList(currentStep.sourceCells, i, j)) {
          fillColor = '#ffecb3';
          strokeColor = '#ff9800';
          strokeWidth = 2;
        } else if (showValue && (i > 0 || j > 0)) {
          fillColor = '#f5f5f5';
        }

        const cellRect = g.append('rect')
          .attr('x', x)
          .attr('y', y)
          .attr('width', CELL_SIZE)
          .attr('height', CELL_SIZE)
          .attr('fill', fillColor)
          .attr('stroke', strokeColor)
          .attr('stroke-width', strokeWidth)
          .style('cursor', showValue ? 'pointer' : 'default');

        // 为已计算的单元格添加悬停事件
        if (showValue) {
          const cellI = i;
          const cellJ = j;
          const cellValue = value;
          cellRect
            .on('mouseenter', function() {
              handleCellHover(cellI, cellJ, cellValue);
            })
            .on('mouseleave', function() {
              handleCellLeave();
            });
        }

        // 显示值
        if (showValue) {
          g.append('text')
            .attr('x', x + CELL_SIZE / 2)
            .attr('y', y + CELL_SIZE / 2)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .attr('font-size', '24px')
            .attr('font-weight', 'bold')
            .attr('font-family', 'monospace')
            .attr('fill', '#333')
            .style('pointer-events', 'none') // 让鼠标事件穿透到下面的rect
            .text(value);
        }
      }
    }



    // 绘制箭头指示值的来源
    if (currentStep && currentStep.sourceCells.length > 0) {
      const targetX = HEADER_SIZE + currentStep.col * CELL_SIZE + CELL_SIZE / 2;
      const targetY = HEADER_SIZE + currentStep.row * CELL_SIZE + CELL_SIZE / 2;
      
      // 匹配时的绿色箭头（更大更明显）
      defs.append('marker')
        .attr('id', 'arrowhead-match')
        .attr('viewBox', '0 -6 12 12')
        .attr('refX', 10)
        .attr('refY', 0)
        .attr('markerWidth', 8)
        .attr('markerHeight', 8)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-6L12,0L0,6')
        .attr('fill', '#2e7d32');
      
      // 不匹配时胜出的箭头（较大值）- 绿色
      defs.append('marker')
        .attr('id', 'arrowhead-winner')
        .attr('viewBox', '0 -6 12 12')
        .attr('refX', 10)
        .attr('refY', 0)
        .attr('markerWidth', 8)
        .attr('markerHeight', 8)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-6L12,0L0,6')
        .attr('fill', '#2e7d32');
      
      // 不匹配时落败的箭头（较小值）- 红色
      defs.append('marker')
        .attr('id', 'arrowhead-loser')
        .attr('viewBox', '0 -6 12 12')
        .attr('refX', 10)
        .attr('refY', 0)
        .attr('markerWidth', 8)
        .attr('markerHeight', 8)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-6L12,0L0,6')
        .attr('fill', '#c62828');

      if (currentStep.transitionType === 'match') {
        // 匹配情况：只画一条箭头（从左上角）
        const source = currentStep.sourceCells[0];
        const sourceX = HEADER_SIZE + source.col * CELL_SIZE + CELL_SIZE / 2;
        const sourceY = HEADER_SIZE + source.row * CELL_SIZE + CELL_SIZE / 2;

        const dx = targetX - sourceX;
        const dy = targetY - sourceY;
        const len = Math.sqrt(dx * dx + dy * dy);
        const unitX = dx / len;
        const unitY = dy / len;

        const startX = sourceX + unitX * 20;
        const startY = sourceY + unitY * 20;
        const endX = targetX - unitX * 20;
        const endY = targetY - unitY * 20;

        // 绘制箭头线
        g.append('line')
          .attr('x1', startX)
          .attr('y1', startY)
          .attr('x2', endX)
          .attr('y2', endY)
          .attr('stroke', '#2e7d32')
          .attr('stroke-width', 3)
          .attr('marker-end', 'url(#arrowhead-match)');
      } else if (currentStep.comparisonInfo) {
        // 不匹配情况：画两条箭头，显示比较过程
        const { topCell, leftCell, topValue, leftValue } = currentStep.comparisonInfo;
        const isTopWinner = topValue >= leftValue;

        // 绘制上方格子的箭头
        const topSourceX = HEADER_SIZE + topCell.col * CELL_SIZE + CELL_SIZE / 2;
        const topSourceY = HEADER_SIZE + topCell.row * CELL_SIZE + CELL_SIZE / 2;
        
        let dx = targetX - topSourceX;
        let dy = targetY - topSourceY;
        let len = Math.sqrt(dx * dx + dy * dy);
        let unitX = dx / len;
        let unitY = dy / len;

        // 上方箭头：胜出用绿色实线，落败用红色虚线
        g.append('line')
          .attr('x1', topSourceX + unitX * 20)
          .attr('y1', topSourceY + unitY * 20)
          .attr('x2', targetX - unitX * 20)
          .attr('y2', targetY - unitY * 20)
          .attr('stroke', isTopWinner ? '#2e7d32' : '#c62828')
          .attr('stroke-width', isTopWinner ? 3 : 2)
          .attr('stroke-dasharray', isTopWinner ? 'none' : '6,3')
          .attr('marker-end', isTopWinner ? 'url(#arrowhead-winner)' : 'url(#arrowhead-loser)');

        // 绘制左方格子的箭头
        const leftSourceX = HEADER_SIZE + leftCell.col * CELL_SIZE + CELL_SIZE / 2;
        const leftSourceY = HEADER_SIZE + leftCell.row * CELL_SIZE + CELL_SIZE / 2;
        
        dx = targetX - leftSourceX;
        dy = targetY - leftSourceY;
        len = Math.sqrt(dx * dx + dy * dy);
        unitX = dx / len;
        unitY = dy / len;

        // 左方箭头：胜出用绿色实线，落败用红色虚线
        g.append('line')
          .attr('x1', leftSourceX + unitX * 20)
          .attr('y1', leftSourceY + unitY * 20)
          .attr('x2', targetX - unitX * 20)
          .attr('y2', targetY - unitY * 20)
          .attr('stroke', !isTopWinner ? '#2e7d32' : '#c62828')
          .attr('stroke-width', !isTopWinner ? 3 : 2)
          .attr('stroke-dasharray', !isTopWinner ? 'none' : '6,3')
          .attr('marker-end', !isTopWinner ? 'url(#arrowhead-winner)' : 'url(#arrowhead-loser)');
      }
    }

  }, [text1, text2, dpTable, currentStep, backtrackPath, backtrackMatchCells, handleCellHover, handleCellLeave, scale]);

  // 渲染带高亮的字符串
  const renderHighlightedString = (str: string, indices: number[], label: string) => {
    return (
      <div className="tooltip-string">
        <span className="tooltip-label">{label}: </span>
        {str.split('').map((char, idx) => (
          <span
            key={idx}
            className={indices.includes(idx) ? 'tooltip-char highlight' : 'tooltip-char'}
          >
            {char}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="dp-table-container" ref={containerRef}>
      <svg ref={svgRef} className="dp-table-svg" />
      
      {/* Tooltip - 显示在格子的正右侧，带箭头指向格子 */}
      {tooltip.visible && (
        <div
          className="cell-tooltip"
          style={{
            left: tooltip.cellX + (BASE_CELL_SIZE / 2) * scale + 8, // 格子右边缘 + 小间距（cellX已经是格子中心）
            top: tooltip.cellY, // 与格子中心对齐
            transform: 'translateY(-50%)', // 垂直居中
          }}
        >
          {/* 左侧箭头指向格子 */}
          <div className="tooltip-arrow" />
          <div className="tooltip-content">
            <div className="tooltip-header">
              <span className="cell-pos">dp[{tooltip.row}][{tooltip.col}]</span>
              <span className="cell-value">= {tooltip.value}</span>
            </div>
            {tooltip.value > 0 ? (
              <>
                <div className="tooltip-lcs">
                  <span className="lcs-label">LCS:</span>
                  <span className="lcs-value">"{tooltip.lcs}"</span>
                </div>
                <div className="tooltip-strings">
                  {renderHighlightedString(text1, tooltip.text1Indices, 'S1')}
                  {renderHighlightedString(text2, tooltip.text2Indices, 'S2')}
                </div>
              </>
            ) : (
              <div className="tooltip-empty">无公共子序列</div>
            )}
          </div>
        </div>
      )}
      
      <div className="legend">
        <span className="legend-item"><span className="dot current"></span> 正在计算</span>
        <span className="legend-item"><span className="arrow-legend green"></span> 匹配/胜出</span>
        <span className="legend-item"><span className="arrow-legend red"></span> 落败</span>
      </div>
    </div>
  );
}
