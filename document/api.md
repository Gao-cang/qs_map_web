# 青山工业区污染管理系统前后端交互API说明书

## 一、概述
### 1.1 适用范围
本说明书定义了青山区多介质污染管理系统前后端交互的API规范，适用于前端（Vue）与后端（Spring Boot）的开发联调，涵盖登录、地图数据、数据管理等核心功能。

### 1.2 通用规范
- **协议**：HTTP/HTTPS
- **请求格式**：JSON，通过`application/json` Content-Type传输
- **响应格式**：统一封装为`{code, msg, data}`结构  
  - `code`：状态码（200成功，400参数错误，401未认证，404资源不存在）  
  - `msg`：状态描述  
  - `data`：响应数据（可为对象、数组或null）
- **认证方式**：登录后返回JWT Token，后续请求需在Header中携带`Authorization: Bearer {token}`


## 二、登录模块API

### 2.1 登录接口
- **URL**：`/api/auth/login`  
- **方法**：POST  
- **请求参数**：  
  ```json
  {
    "phone": "13812345678",  // 手机号（必填）
    "password": "123456"     // 密码（必填，明文传输，后端需加密存储）
  }
- **响应数据**：
```json
{
  "code": 200,
  "msg": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",  // JWT Token
    "userInfo": {
      "userId": 1,
      "userName": "张三",
      "userRole": "visitor"  // 角色：visitor/admin（本项目暂不区分）
    }
  }
}
```
- **错误响应**：
  - 400（参数缺失）：`{code: 400, msg: "手机号或密码为空"}`
  - 401（认证失败）：`{code: 401, msg: "手机号或密码错误"}`

## 三、地图模块 API
### 3.1 获取监测点列表
- URL：/api/stations
- 方法：GET
- 查询参数：
    - type：污染类型（可选，值为soil/vegetable/air，默认返回全部类型）
- 响应数据：
```json
{
  "code": 200,
  "msg": "成功",
  "data": [
    {
      "id": 1,
      "name": "和平公园土壤监测点",
      "lng": 114.3568,
      "lat": 30.6123,
      "type": "soil"  // 类型与type参数对应
    },
    {
      "id": 5,
      "name": "青山热电厂空气监测点",
      "lng": 114.3892,
      "lat": 30.6215,
      "type": "air"
    }
  ]
}
```
### 3.2 获取监测点详情
- URL：/api/stations/{id}
- 方法：GET
- 路径参数：
    - id：监测点ID（必填，如1）
    - 响应数据：
```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "name": "和平公园土壤监测点",
    "lng": 114.3568,
    "lat": 30.6123,
    "type": "soil",
    "pollutants": {  // 污染物数据根据type动态返回
      "pb": 35.6,
      "cu": 28.9,
      "healthLevel": "安全"  // 健康等级（后端计算返回）
    }
  }
}
```
- 错误示例：
    - 404（资源不存在）：`{code: 404, msg: "监测点ID不存在"}`

### 3.3 非监测点数据查询
- URL：/api/nearby
- 方法：GET
- 查询参数：
    - lng：经度（必填，如114.3500）
    - lat：纬度（必填，如30.6000）
- 响应数据：
```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "type": "soil",  // 模拟附近监测点类型
    "pollutants": {
      "pb": 38.2,
      "healthLevel": "轻度污染"
    }
  }
}
```
- 说明：后端可返回模拟数据或通过插值算法生成附近区域污染物估算值

## 四、数据添加模块 API
### 4.1 提交新数据
- URL：/api/stations
- 方法：POST
- 请求参数：
```json
{
  "name": "工业二路土壤监测点",  // 点位名称（必填）
  "lng": 114.3654,                // 经度（必填）
  "lat": 30.6189,                // 纬度（必填）
  "time": "2025-06-05 14:30:00",  // 采样时间（必填，格式：YYYY-MM-DD HH:mm:ss）
  "type": "soil",                 // 类型（必填，soil/vegetable/air）
  // 以下字段根据type动态传递
  "pb": 45.0,                     // 土壤/蔬菜污染物（type为soil/vegetable时必填）
  "pm25": 60                      // 空气污染物（type为air时必填）
}
```

- 响应数据：
```json
{
  "code": 200,
  "msg": "提交成功，待审核",
  "data": {
    "logId": 1001  // 新数据ID
  }
}
```

- 错误处理：
    - 400（参数缺失）：{code: 400, msg: "点位名称或经纬度为空"}
    - 409（点位重复）：{code: 409, msg: "监测点位名已存在"}


## 五、数据管理模块 API
### 5.1 获取待审核数据列表
- URL：/api/stations/awaiting
- 方法：GET
- 响应数据：
```json
{
  "code": 200,
  "msg": "成功",
  "data": [
    {
      "logId": 1001,
      "name": "工业二路土壤监测点",
      "time": "2025-06-05 14:30:00",
      "type": "soil",
      "status": "unconfirmed"  // 状态：unconfirmed（未确认）/confirmed（已确认）/rejected（已拒绝）
    }
  ]
}
```

### 5.2 审核数据
- URL：/api/stations/{logId}/approve（通过）或 /reject（拒绝）
- 方法：POST
- 路径参数：
    - logId：数据 ID（如1001）
- 响应数据：
```json
{
  "code": 200,
  "msg": "审核通过",
  "data": null
}
```

- 说明：
    - 通过接口：/api/stations/1001/approve，状态改为confirmed
    - 拒绝接口：/api/stations/1001/reject，状态改为rejected


### 5.3 删除已入库数据
- URL：/api/stations/{logId}
- 方法：DELETE
- 路径参数：
    - logId：数据 ID（如1001）
- 响应数据：
```json
{
  "code": 200,
  "msg": "数据已删除",
  "data": null
}
```

- 错误示例：
    - 403（无权限）：`{code: 403, msg: "无删除权限"}`（本项目暂不校验权限，可忽略）