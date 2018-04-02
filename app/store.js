import { createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga'
import reducer from 'reducer'
import rootSaga from 'sagas/index'

const sagaMiddleware = createSagaMiddleware()

export default createStore(
  reducer,
  applyMiddleware(sagaMiddleware)
)

// todo 为什么在中间件和reducer传参给store后再启动saga
sagaMiddleware.run(rootSaga)