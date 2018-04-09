# Tetris开发心路历程
## 简介

**俄罗斯方块**是对90后来讲非常有情怀的一种益智游戏。

**操作简介**：
  - W——控制物块的旋转变化
  - A、D——控制物块的左右移动
  - S——控制物块的加速下落
  - 空格——控制物块直接下落到底

状态：开发中

**[点击这里试玩游戏](https://wemmaling.github.io/Tetris/)**

## 使用技术

1. **React**构建视图层
2. **redux-saga**管理业务逻辑

## 预想难点

1. 物块的碰撞（包括与墙的碰撞以及与其他物块的碰撞）：
   - 与其他物块的碰撞：通过判断物块将要到达的位置，静态地图中该位置是否已经存在物块
   - 与墙壁的碰撞：判断物块**最边缘**的坐标是否超过绘制背景时的边缘行和列
2. 物块的旋转
3. 落下物块的随机生成器
    - 随机函数，方向随机 + 形状随机
4. 游戏得分逻辑
    - 一次性消1行100分，2行200分，3行400分，4行800分
5. 消除原生js监听按键时的突变性
    - 使用redux-saga解决，相关APItake，cancel，delay等

## 数据结构设计

1. 地图和Tetromino怎样存储
    - 将静态背景和移动中的物块分开存储，静态背景存为一个二维数组，动态物块存储物块的类型和坐标（以物块左上角小方块的坐标为参照坐标，根据delta中存储的相对dRow和dCol可以绘制物块）
2. 跟Tetromino旋转相关的数据结构怎样设计
     - 使用一个四维数组存储，以旋转中心点为原点，记录每个物块相对于原点的位置
     - 在程序运行前，利用旋转函数计算每个图形的旋转数据并存入数组，方便旋转时直接访问
3. 当前下落的物块需记录哪些信息
     - 首先，要记录类型，便于绘制图形
     - 其次，记录物块原点在地图中的行列位置
     - 另外，要记录当前物块的旋转方向

## redux-saga对状态修改时的处理

1. 物块的下落：
   - 自动下落：使用redux-saga提供的delay函数，fork一个generator函数，每隔一段时间dispatch一个下落的Action
   - 控制移动：传入移动的dRow，dCol，计算出tetromino的下一个位置，通过函数canMove判断能否移动到该位置（下一位置是墙壁或者有物块存在均不能移动），如果物块当前的动作是下落，且不能移动，则dispatch action将物块和背景地图进行合并
2. 收到合并的action时，合并当前TetrisMap和物块：
   - 重新掉落Tetromino：在更新地图之前，将state中的curTetromino重置
   - 更新静态地图：根据当前物块的type和坐标update TetrisMap
3. 物块的旋转逻辑:
   - （最开始计算一次，后续直接访问常量）每个物块的初始定义方向，设置一个通用函数顺时针改变方向
   - 在state中的curTetromino中增加方向属性
   - 旋转后更新curTetromino中的方向属性值，更新物块
4. 长按左右下键时的事件捕获和事件处理
    - （加速下降）使用take阻塞等待相应（action）按键按下后，更新速度，完成自动下落加速，再等待案件释放的action，监听到按键释放时，恢复速度
    - （加速左右移动）大致流程同上，不同在于等到按键按下时，向左移动或向右移动的速度通过delay()控制加速，按键释放时，取消加速过程
5. 物块的直接下落
    - 通过当前的物块位置，计算垂直向下物块能移动到的最终位置，直接更新curTetromino并合并动态物块和静态背景



