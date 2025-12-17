# Requirements Document

## Introduction

本项目旨在创建一个交互式的最长公共子序列(LCS)动态规划算法可视化演示工具。目标用户是算法初学者，通过动画演示帮助他们理解动态规划的核心思想：如何将大问题分解为小问题，以及如何通过填表法逐步求解。

## Glossary

- **LCS (Longest Common Subsequence)**: 最长公共子序列，两个字符串共同拥有的最长子序列
- **子序列 (Subsequence)**: 从原字符串中删除某些字符（可以不删除）后形成的新字符串，保持相对顺序不变
- **DP表 (DP Table)**: 动态规划表格，用于存储子问题的解
- **状态转移 (State Transition)**: 从已知子问题的解推导当前问题解的过程
- **可视化系统 (Visualization System)**: 本项目开发的LCS算法演示工具

## Requirements

### Requirement 1

**User Story:** 作为一个算法初学者，我想要输入两个字符串，以便观察LCS算法如何处理这些输入。

#### Acceptance Criteria

1. WHEN 用户访问页面 THEN 可视化系统 SHALL 显示两个文本输入框用于输入字符串
2. WHEN 用户输入字符串 THEN 可视化系统 SHALL 限制输入长度在1到10个字符之间
3. WHEN 用户输入字符串 THEN 可视化系统 SHALL 仅接受小写英文字母
4. WHEN 用户点击开始按钮 THEN 可视化系统 SHALL 初始化DP表并开始演示

### Requirement 2

**User Story:** 作为一个算法初学者，我想要看到DP表格的可视化展示，以便理解动态规划的表格结构。

#### Acceptance Criteria

1. WHEN 演示开始 THEN 可视化系统 SHALL 显示一个(m+1)×(n+1)的表格，其中m和n分别是两个字符串的长度
2. WHEN 显示表格 THEN 可视化系统 SHALL 在第一行显示text2的每个字符作为列标题
3. WHEN 显示表格 THEN 可视化系统 SHALL 在第一列显示text1的每个字符作为行标题
4. WHEN 初始化表格 THEN 可视化系统 SHALL 将第一行和第一列的值设为0

### Requirement 3

**User Story:** 作为一个算法初学者，我想要逐步观看DP表格的填充过程，以便理解状态转移方程是如何工作的。

#### Acceptance Criteria

1. WHEN 填充单元格 THEN 可视化系统 SHALL 高亮当前正在计算的单元格
2. WHEN 两个字符相等时 THEN 可视化系统 SHALL 显示dp[i][j] = dp[i-1][j-1] + 1的计算过程，并高亮对角线单元格
3. WHEN 两个字符不相等时 THEN 可视化系统 SHALL 同时高亮上方单元格dp[i-1][j]和左方单元格dp[i][j-1]，显示两个值的比较过程，并标注较大值的来源方向
4. WHEN 每步计算完成 THEN 可视化系统 SHALL 在单元格中显示计算结果
5. WHEN 状态转移发生 THEN 可视化系统 SHALL 用箭头或颜色指示值的来源方向

### Requirement 4

**User Story:** 作为一个算法初学者，我想要控制动画的播放速度和进度，以便按照自己的节奏学习。

#### Acceptance Criteria

1. WHEN 演示进行中 THEN 可视化系统 SHALL 提供暂停和继续按钮
2. WHEN 演示进行中 THEN 可视化系统 SHALL 提供单步前进按钮
3. WHEN 演示进行中 THEN 可视化系统 SHALL 提供速度调节滑块，范围从0.5x到3x
4. WHEN 用户点击重置按钮 THEN 可视化系统 SHALL 清空DP表并返回初始状态

### Requirement 5

**User Story:** 作为一个算法初学者，我想要看到文字解释当前步骤，以便理解每一步的含义。

#### Acceptance Criteria

1. WHEN 填充每个单元格时 THEN 可视化系统 SHALL 在解释区域显示当前比较的两个字符
2. WHEN 填充每个单元格时 THEN 可视化系统 SHALL 解释为什么选择当前的状态转移方式
3. WHEN 演示完成 THEN 可视化系统 SHALL 显示最终的LCS长度和一个可能的LCS字符串

### Requirement 6

**User Story:** 作为一个算法初学者，我想要看到回溯过程的可视化，以便理解如何从DP表中构造出实际的LCS。

#### Acceptance Criteria

1. WHEN DP表填充完成 THEN 可视化系统 SHALL 提供"显示回溯"按钮
2. WHEN 用户点击显示回溯 THEN 可视化系统 SHALL 从右下角开始高亮回溯路径
3. WHEN 回溯经过字符匹配的单元格 THEN 可视化系统 SHALL 特别标记该单元格并显示对应字符
4. WHEN 回溯完成 THEN 可视化系统 SHALL 在两个原始字符串中高亮显示LCS中的字符

### Requirement 7

**User Story:** 作为一个算法初学者，我想要看到Java代码与动画步骤的精确对应，以便理解代码每一行的执行效果。

#### Acceptance Criteria

1. WHEN 演示开始 THEN 可视化系统 SHALL 在页面左侧显示完整的Java LCS解题代码
2. WHEN 动画执行到某一步 THEN 可视化系统 SHALL 高亮当前正在执行的代码行
3. WHEN 字符比较相等时 THEN 可视化系统 SHALL 高亮if分支中的dp[i][j] = dp[i-1][j-1] + 1代码行
4. WHEN 字符比较不相等时 THEN 可视化系统 SHALL 高亮else分支中的dp[i][j] = Math.max(...)代码行
5. WHEN 代码行被高亮 THEN 可视化系统 SHALL 在该行旁边显示当前变量值的实时标注

### Requirement 8

**User Story:** 作为一个算法初学者，我想要在单屏幕内看到所有关键信息，以便无需滚动即可理解算法执行过程。

#### Acceptance Criteria

1. WHEN 用户访问页面 THEN 可视化系统 SHALL 采用三栏布局：左侧代码、中间DP表格、右侧控制和解释
2. WHEN 显示布局 THEN 可视化系统 SHALL 确保所有内容在标准屏幕(1920x1080)内完整显示无需滚动
3. WHEN 显示解释 THEN 可视化系统 SHALL 使用简洁的图标和颜色编码减少文字量
4. WHEN 显示当前步骤 THEN 可视化系统 SHALL 同时在代码、表格和解释区域提供视觉联动反馈

### Requirement 9

**User Story:** 作为一个算法初学者，我想要看到更直观的步骤解释，以便快速理解每一步的含义。

#### Acceptance Criteria

1. WHEN 显示步骤解释 THEN 可视化系统 SHALL 使用大字体显示当前比较的两个字符
2. WHEN 字符相等 THEN 可视化系统 SHALL 使用绿色背景和✅图标表示匹配成功
3. WHEN 字符不相等 THEN 可视化系统 SHALL 使用黄色背景和❌图标表示不匹配
4. WHEN 显示计算结果 THEN 可视化系统 SHALL 用简洁公式展示：相等时"左上+1=值"，不等时"max(上,左)=值"
5. WHEN 演示进行中 THEN 可视化系统 SHALL 提供视觉提示引导用户关注代码高亮行和表格箭头
