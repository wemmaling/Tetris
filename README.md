**[点击这里试玩游戏](https://wemmaling.github.io/Tetris/)**

# 操作设置

- W/ArrowUp: 旋转
- A/ArrowLeft: 左移
- D/ArrowRight: 右移
- S/ArrowDown: 加速下落
- ESC/鼠标点击"暂停"或"继续"按钮: 暂停/继续
- Z: 改变当前旋转方向
- C: 存储当前Tetromino并释放hold中存储的Tetromino(若hold中无存储，则掉落新的Tetromino)
- 鼠标点击"简易模式"/"正常模式": 显示/关闭当前Tetromino的掉落预览
- 鼠标点击"重新开始": 重新开始新的游戏
# 得分规则
- 一次性消除1行: 100
- 一次性消除2行: 300
- 一次性消除3行: 500
- 一次性消除4行: 800
- 长按下键加速下落: 1 * 距离
- 直接下落到底部: 2 * 距离
# 关卡设置
当`score >= 1000 + level * (level - 1) * 500`时自动进入下一关卡，速度增加为`(level + 1) * 0.5`
# redux-saga游戏逻辑
1. `rootSaga`: 默认启动的saga。在该saga中`fork(watchGameStatus)`来监听游戏的状态以及游戏逻辑的Actions。

2. `​watchGameStatus`: 设置游戏逻辑并监听游戏进行中发出的Actions。使用redux-saga提供的take API阻塞监听一些Actions的发出。如`take([A.CONTINUE, A.RESTART])`，等待数组中的Actions被dispatch后，再继续之后的游戏逻辑。
    - `dropLooop`:
    - `dropKeyUpAndDown`:
    - `lrKeyUpAndDown`:
```javascript
function* watchGameStatus() {
  while (true) {
    yield take([A.CONTINUE, A.RESTART]) // 阻塞监听"游戏继续"和"游戏重新开始"Actions
    yield takeEvery(A.GAME_OVER, gameOver)
    yield race([
      // 监听游戏中一些Actions(RORATE/DROP_DIRECTLY/HOLD_TETROMINO/KEY_DOWN/KEY_ON)的dispatch，并执行对应saga函数
      gameActions(),
      // 物块自动下落
      call(dropLoop),
      // 监听下键的按下与释放
      call(dropKeyUpAndDown),
      // 监听左右按键的按下与释放
      call(lrKeyUpAndDown),
      // 阻塞监听"游戏暂停"和"游戏结束"
      take([A.PAUSE, A.UPDATE_GAME_STATUS]),
    ])
  }
}
```
3. `keyDown/keyUp`: 处理按键时的游戏逻辑

4. `move`: Tetromino的移动，接收参数为行列的变化量`(dRow, dCol)`，并判断该移动行为是否能够进行，如发生碰撞不能进行，考虑是以下三种情况的哪一种: (1)游戏结束 （2）向下无法移动且游戏未结束，此时需要合并移动物块和静态背景 (3) 向左右无法移动，此时更新移动物块的位置即可

5. `mergeMapAndDrop`: 合并移动物块和静态背景，对state中的`tetrisMap`进行更新并掉落新的Tetromino，在这过程中判断是否满足消除要求。在游戏逻辑中，在两种情况下需要调用`mergeMapAndDrop`函数: (1) 无法继续下落的情况 (2) 键盘操控直接下落到底部。

6. `clearLines`: 当`tetrisMap`中某一行都变成了非'X'(空白)元素，则消除该行并计算得分。

7. `dropNewOne`: 将next预览中的Tetromino赋值给`curTetromino`，并随机生成新的next预览

8. `rorate`: 控制Tetromino的旋转。在旋转前，已经根据物块旋转的原点生成各类型物块的旋转数组。

9. `gameOver`:监听游戏结束的Action(`GAME_OVER`)的发出，当捕获到对应Action时，调用`gameOver`函数执行游戏结束的逻辑。更新游戏状态`isGameOver`，判断分数是否超过localStorage存储的最高分，若超过，则更新。

10. `handleHold`: 存储当前物块并取出hold中保存的物块。注意，每个物块只可以被存储一次，在`curTetromino`中使用`canBeHold`标记，如果当前hold中没有存储物块，则直接掉落新的物块。

11. `changeCurTetromino`: 更新当前物块`curTetromino`与其预览`forecast`

12. `dropDirectly`: 将当前Tetromino直接合并到预览下落位置上。其中预览下落位置通过`curTetromino`和`tetrisMap`计算得到

# Redux中state存储数据
```javascript
const initialState = Map({
  // 当前存储的背景数据结构
  tetrisMap: Repeat(Repeat("X", 10).toList(), 20).toList(),
  // 正在下落的tetromino类型以及当前坐标
  curTetromino: dropRandom(),
  // 下一掉落物块
  nextTetromino: dropRandom(),
  // 当前下落物块的掉落预览
  forecast: null,
  // 临时存储块
  hold: null,
  // 计算得分
  score: 0,
  // 关卡
  level: 1,
  // 游戏是否结束
  isGameOver: false,
  // 涉及开始页的显示
  isGoing: false,
  // 游戏是否暂停
  isPaused: false,
  // 帮助模式
  helpSchemaOn: false,
  // 旋转方向，1为顺时针，-1为逆时针
  rorateDir: -1,
})
```
