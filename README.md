# 생체정보를 활용한 대중교통 승하차 시스템<br/>(정맥인식을 이용한 대중교통 승하차 시스템)
## 서버부분

### 개발 목적
본 프로젝트의 최종목표는 대중교통 이용자들의 불편함을 해소하고, 더욱 편리하고 안전한 대중교통 이용환경을 제공하는 게 목표다.
따라서 등록기와 인식기 두 개의 하드웨어를 개발하여 손바닥 정맥 인식 센서를 개발하는 게 첫 번째 목표이며, 이렇게 학습된 패턴을 관리하는 시스템을 구축하고,
앱과의 연동을 통해 대중교통을 원활히 이용할 수 있도록 돕는 것이 목표라 볼 수 있다.

### 개발 환경
서버 : <img src="https://img.shields.io/badge/Node.js-339933?style=flat&logo=Node.js&logoColor=white"><br/>
클라이언트 : <img src="https://img.shields.io/badge/Kotlin-7F52FF?style=flat&logo=kotlin&logoColor=white"><br/>
하드웨어 :  <img src="https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white"><br/>
데이터베이스 :  <img src="https://img.shields.io/badge/MariaDB-003545?style=flat&logo=mariadb&logoColor=white"><br/>
Framwork : <img src="https://img.shields.io/badge/Android Studio-3DDC84?style=flat&logo=androidstudio&logoColor=white">
          <img src="https://img.shields.io/badge/TensorFlow Lite-FF6F00?style=flat&logo=tensorflow&logoColor=white">
          <img src="https://img.shields.io/badge/OpenCV-5C3EE8?style=flat&logo=opencv&logoColor=white">
          <img src="https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white">
          <img src="https://img.shields.io/badge/Ubuntu-E95420?style=flat&logo=ubuntu&logoColor=white"><br/>
외부API : PortOne

### 서버
  + API 명세서 - 추후에 추가 예정

|Endpoint|Description|Request|Response Data|  
|:---:|:---:|:---|:---|
|POST /login|로그인|\- id : string <br/> \- pwd : string|\- success : boolean <br/>\- message : string <br/>\- name : string <br/>\- email : string|   
|POST /register|회원가입|\- id : string<br/>\- pwd : string<br/>\- name : string<br/>\- email : string(이메일 인증 용도)<br/>\- birth : string<br/>(생년월일 yyyymmdd , 결제 시 어른, 청소년, 아이 구분하기 위한 용도)<br/>\- certification : boolean(이메일 인증 여부)<br/>|\- success : boolean <br/> \- message : string|  
|GET /find-id|아이디 찾기|(params)<br/>\- name : string<br/>\- email : string<br/>\- certification : boolean<br/>(이메일 인증 여부)|\- success : boolean<br/>\- message : string|   
|DELETE /delete|회원 삭제|\- id : string<br/>\- pwd : string|\- success : boolean <br/>\- message : string|



### 클라이언트
주소 : https://github.com/jUqItEr/HiFive.git
