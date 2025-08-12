# Echarts 유틸리티 클래스
>### ehcarts를 보다 쉽게 생성, 초기화, 조작하기 위한 사용자 정의 유틸리티 클래스
**버전 :** `echarts v6.0.0`  
**작성자 :** `tyche0529@gmail.com`  

## 참고
#### 공식 사이트 URL
* https://echarts.apache.org
#### Document API URL
* https://echarts.apache.org/en/api.html#echarts
#### echarts 테마 커스터마이징 및 다운로드 URL
* https://echarts.apache.org/en/theme-builder.html  

## 시작하기
*  유틸 클래스보다 상단에 아래 스크립트 삽입 후 시작
   + **\<script src="https://cdn.jsdelivr.net/npm/echarts@6.0.0/dist/echarts.min.js
"></script>**

<br>

* 순서
  1. default 옵션 생성
  2. 데이터 시리즈 생성
  3. Echarts를 이용하여 차트 생성

#### 1. default 옵션 생성
- ECharts.generateDefaultOption 사용
```javascript
const defaultOption = {
    ...ECharts.generateDefaultOption(),
    title: {
        text: 'defaultOption 제목',
        subtext: 'defaultOption 부제목',
        left: 'center'
    },
    xAxis: {
        type: 'category',
        data: ['배', '사과', '따지', '복숭아', '바나나'],
        axisLabel: { rotate: 0 }    
    },
};
```
<br>

#### 2. 데이터 시리즈 생성
- ECharts.createSeries[Line, Bar] 사용
```javascript
const data1 = [
    ECharts.createSeriesLine('과일', [120, 200, 150, 80, 70, 110]),
    ECharts.createSeriesBar('고기', [120, 200, 150, 80, 70, 110])
];
```
<br>

#### 3. Echarts를 이용하여 차트 생성
- 옵션과 시리즈(데이터) 그리고 테마를 생성자 함수에 넣기 전에 준비.
- 파라미터 정보 : new ECharts('태그ID', option, seriers, theme)
```javascript
<body>
    <div id="main1" style="width: 400px; height: 600px;"></div>

    <script type="text/javascript">
        //... 생략 ...

        //default 옵션에서 일부 수정 (선택)
        const lineOption = {
            ...defaultOption,
            tooltip: {
                trigger: 'axis'
            },
            xAxis: {
                type: 'category',
                data: ['바나나', '포도', '따지', '배', '키위'],
                axisLabel: { rotate: 0 }    
            },
        };

        // 테마 light|dark 모드 선택 그외는 목록에서 테마 설정 참고
        const chart = new ECharts('main1', lineOption, data1, 'dark');

        // 리사이징 기능 활성화(선택)
        chart.startResizeObserver();
    </script>
</body>
```  
<br>

## 기능목록
- [시작하기](#시작하기)
- [기본 옵션 생성 메소드](#generatedefaultoption)
- [차트 완전 삭제 기능](#destroy)
- [데이터 변경 기능](#updateseriesdata)
- [echart 실제 객체 리턴 기능](#chart)
- [이벤트 관련 기능](#event)
- [부모 요소 크기 변화 시 resize 기능](#resizeobserver)
- [사용자 상호작용시 여러개 차트 동시 반응](#chartsync)
- [테마 설정](#fetchresistertheme)
- [차트에 데이터를 다양한 시각화 표출 기능](#createseries)  

## 기능 설명 및 예시
- chart1은 new ECharts로부터 생성된 인스턴스이다.
### destroy
- 차트를 완전 삭제 기능을 한다.
- 차트와 관련된 소스들 옵저버와 같은 것들도 함께 한다.
```javascript
..option, data 설정 생략...

const chart = new ECharts('ElementId', option, data, 'dark');

// 해당 차트 인스턴스 관련 자원 해제
chart.destroy()
```
[기능 목록 보기](#기능목록)
<br>

### updateSeriesData
- updateSeriesData(Array<ECharts.createSeries[Line,Bar..]>)
- 차트 데이터(series) 수정 기능을 한다.
- 여러 데이터를 수정 시 배열에 담고, 단일 데이터 수정 시 배열에 담지 않아도 된다.
- createSeries를 이용하여 series의 라벨과 data를 수정할 수 있다.
- 또한 아래와 같이 차트 종류와 값 모두 변경 가능 bar -> line, line -> bar
```javascript
// 기존 데이터
const data = [
    ECharts.createSeriesLine('과일', [120, 200, 150, 80, 70, 110]),
    ECharts.createSeriesBar('고기', [120, 200, 150, 80, 70, 110])
];

// ...옵션 설정 생략...

const chart = new ECharts('ElementId', option, data, 'dark');

// 차트 변경 및 값 변경
chart.updateSeriesData([
    ECharts.createSeriesLine('고기', [1808, 1000, 100, 800, 2000, 1100]),
    ECharts.createSeriesBar('과일 ', [1808, 1000, 100, 800, 2000, 1100]),
]);
```
[기능 목록 보기](#기능목록)
<br>

### chart
- Echart 유틸리티 인스턴스 객체로부터 echarts 객체를 리턴하는 기능을 한다.
```javascript
//...option, data 설정 생략...

const chart = new ECharts('ElementId', option, data, 'dark');

// 유틸리티 인스턴스에서 chart를 호출 시 실제 echarts 객체 반환
chart.chart
```  
[기능 목록 보기](#기능목록)
<br>

### event
- on / findEventList / off메소드를 이용하여 차트의 이벤트를 추가 삭제 기능을 한다.

#### on
- on(eventType, callback, description)
- 이벤트 추가 시 사용하는 메소드
- 이벤트 타입, callback, 어떤 함수인지 표기(eventList에서 찾을 때 유용, 작성 권장)
* 지원하는 이벤트 예시
  + click
  + dblclick
  + mouseover
  + mouseout

```javascript
const log = console.log;
const clickShowEl = document.getElementById('main1Display')

//...생략...

const chart = new ECharts('ElementId', option, data, 'dark');
chart.on('click', function (params) {
    clickShowEl.textContent = `name : ${params.value}, value : ${params.value}`;
    log(params);
    log(params.name);
    log(params.value);
}, '로그 찍는 이벤트');
``` 
#### findEventList
- **findEventList({eventType, callback, description})**
- 어떤 이벤트를 가지고 있는지 조회 및 특정 이벤트 조회하는 기능.
- 이벤트 삭제 시 도움이 되는 메소드
```javascript

//...생략...

// 클릭 관련 이벤트 찾기
chart.findEventList({eventType : 'click'})

// 클릭 및 callback으로 찾기
chart.findEventList({eventType : 'click', callback : eventCallback})

// description을 설정 후 찾는다면 콜백을 따로 변수에 담아주지 않아도 찾기 가능
chart.findEventList({description : '로그 찍는 함수'})
// -> 반환 : {eventType: 'click', description: '로그 찍는 함수', callback: ƒ}
``` 
#### off
- **off(eventType, callback)**
- 이벤트 삭제 시 사용하는 메소드
- 어떤 이벤트인지와 event callback을 넣어주면 이벤트 삭제
```javascript

//...생략...

const findClickCallback = chart.findEventList({description : '로그 찍는 함수'});
chart.off(findClickCallback.eventType, findClickCallback.callback);
``` 
[기능 목록 보기](#기능목록)
<br> 

### ResizeObserver
- **startResizeObserver**, **stopResizeObserver** 사용
- 기본적으로 윈도우 및 부모 태그 크기 변동에 따른 사이즈 자동 변경 지원하지 않음.
- **startResizeObserver**, **stopResizeObserver** 사용 시 자동으로 크기 변동 감지하여 동적변경이 되는 기능.
```javascript
const chart = new ECharts('ElementId', lineOption, data1, 'dark');

// 부모 태그 사이즈 변동 감지
chart.startResizeObserver();

// 부모 태그 사이즈 변동 감지 삭제
chart.stopResizeObserver();
``` 
[기능 목록 보기](#기능목록)
<br> 

### chartSync
- **chartSyncConnect**, **chartSyncDisConnect**, **getGroupName** 사용
- 여러차트를 그룹으로 묶어서 상호작용을 동기화를 해주는 함수.
#### 1. chartSyncConnect
```javascript
const shareData = [
    { value: 1048, name: 'Search Engine' },
    { value: 735, name: 'Direct2' },
    { value: 580, name: '띠따오지' },
    { value: 484, name: 'Union Ads' },
    { value: 300, name: 'Video Ads' }
]

// 원형 차트 예시 - ECharts.createSeriesPie 사용
const data1 = ECharts.createSeriesPie('원형 차트', shareData]);
// 원형 시리즈 데이터를 가지고 Echarts로 표출
const chart1 = new ECharts('ElementId1', defaultOption, data1, null);

// 도넛 차트 예시 - ECharts.createSeriesDonuts 사용
const data2 = ECharts.createSeriesDonuts('도넛차트', shareData);
// 도넛 시리즈 데이터를 가지고 Echarts로 표출
const chart2 = new ECharts('ElementId2', defaultOption, data2, null);

// chart1과 chart2 이벤트 상호작용 동기화 연결
// 첫번째 방법 - 클래스를 이용하여 연결
ECharts.chartSyncConnect([chart1, chart2]);

// 두번째 방법 - 인스턴스에서 바로 다른 차트와 연결
chart1.chartSyncConnect(chart2);
``` 
#### 2. chartSyncDisConnect
- 내부적으로 그룹 이름을 지정해서 같은 그룹만 상호작용을 일으킴.
- 타겟 차트의 그룹 이름을 동기화에서 제거하면 타켓 차트과 같은 그룹으로 있던 다른 차트들도 상호작용 제거됨.
- 복수개로 넣을 땐 서로 다른 그룹인걸 배열로 담아서 한번에 복수개의 상호작용을 삭제.
```javascript
// chart1과 chart2 이벤트 상호작용 동기화 연결 해제
// 첫번째 방법 - 클래스를 이용하여 연결
ECharts.chartSyncDisConnect([chart1, chart2]);

// 두번째 방법 - 인스턴스에서 바로 다른 차트와 연결 해제
chart1.chartSyncDisConnect();
``` 
#### 3. getGroupName
- 내부적으로 그룹 이름을 지정해서 같은 그룹만 상호작용을 일으킴.
- 즉 해당 차트가 어떤 그룹이름을 가지고 있는지 확인하는 기능의 함수.
- 이름 중복을 피하기 위해 그룹이름 미지정시 자동 symbol로 지정으로 구현함.
```javascript
chart1.getGroupName()
// 출력 : Symbol(chartSync)
chart2.getGroupName()
// 출력 : Symbol(chartSync)
``` 
[기능 목록 보기](#기능목록)
<br>  

### generateDefaultOption
- 기본 옵션을 생성해주는 기능
- 기본 옵션 자체를 수정 필요 시 덮어쓴 후 defaultOption으로 재사용 하면 됨.
```javascript
const defaultOption = {
    ...ECharts.generateDefaultOption(),
    title: {
        text: 'defaultOption 제목',
        subtext: 'defaultOption 부제목',
        left: 'center'
    }
};

// 예시 chart1, chart1 옵션 공유
const chart1 = new ECharts('divId1', defaultOption, data1, null);
const chart2 = new ECharts('divId2', defaultOption, data2, null);

// 예시 chart3, chart4 옵션 일부 덮어쓴 후 사용
const lineOption = {
    ...defaultOption,
    tooltip: {
        trigger: 'axis'
    },
    xAxis: {
        type: 'category',
        data: ['배', '사과', '따지', '복숭아', '바나나'],
        axisLabel: { rotate: 0 }    
        
    },
};
const chart3 = new ECharts('divId3', lineOption, data1, null);

const boxplotOption = {
    ...defaultOption,
    xAxis: {
        type: 'category',
        data: ['boxplot1', 'boxplot2'],
        axisLabel: { rotate: 0 }    
    },
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'cross'
    },
}
// 예시 차트 3
const chart4 = new ECharts('divId4', boxplotOption, data4, null);
``` 
[기능 목록 보기](#기능목록)
<br> 

### fetchResisterTheme
- ECharts.fetchResisterTheme('JSON 테마 소스 위치')
- 비동기를 이용하여 테마관련 JSON 파일을 다운로드 하는 함수.
- 첫번째로 echarts 테마 커스터마이징 및 다운로드 URL에서 json 형태로 테마 파일을 JSON으로 받음.
- 사이트에서 download 버튼으로 받아야 중국어로 다운 안돼고 영어로 받아짐.
- 해당 함수를 이용하여 비동기로 테마 주입 또는 JS로 다운받아 script태그를 이용하여 동기식으로도 테마 적용은 가능함.
```javascript
// 비동기 이용
const log = console.log;

ECharts.fetchResisterTheme('./chalk.json')
.then(themeName => {
    // 테마 json 다운로드 후 테마 이름을 주입하여 테마 적용.
    const chart = new ECharts('divId', option, data, themeName);

    // 리사이징 감시 시작.
    chart.startResizeObserver();

    // 값 수정
    // 아래와 같이 형태와 값 모두 변경 가능 bar -> line, line -> bar
    chart.updateSeriesData([
        ECharts.createSeriesLine('고기', [1808, 1000, 100, 800, 2000, 1100]),
        ECharts.createSeriesBar('과일 ', [1808, 1000, 100, 800, 2000, 1100]),
    ]);

    // 이벤트 주입
    chart.on('click', function (params) {
        log(params);
        log(params.name);
        log(params.value);
    });
})
``` 
[기능 목록 보기](#기능목록)
<br> 

### createSeries
- 차트의 series 데이터 생성
- 표출될 차트 모양과 데이터 관련하여 틀에 맞게 생성해주는 함수.
* 생성메소드 종류
  + createSeriesLine('데이터 이름', Array\<any>)
  + createSeriesBar('데이터 이름', Array\<any>)
  + createSeriesBoxPlot('데이터 이름', Array\<any>)
  + createSeriesPie('데이터 이름', Array\<{name: string, value: number}>)
  + createSeriesDonuts('데이터 이름', Array\<{name: string, value: number}>)
- ECharts는 series 데이터를 담는 그릇.
- 필요한 형태의 serires 데이터 생성 후 Echarts에 넣으면 원하는 형태의 차트 표형 가능함.
```javascript
// 라인 시리즈 데이터 생성
ECharts.createSeriesLine('라인', [120, 200, 150, 80, 70, 110])

// 바 시리즈 데이터 생성
ECharts.createSeriesBar('바', [120, 200, 150, 80, 70, 110])

// 박스플롯 시리즈 데이터 생성
ECharts.createSeriesBoxPlot('박스플롯', [
    [20, 34, 10, 38],
    [38, 15, 5, 42],
])

// 원형 시리즈 데이터 생성
ECharts.createSeriesPie('원형', [
    { value: 1048, name: 'Search Engine' },
    { value: 735, name: 'Direct2' },
    { value: 580, name: '띠따오지' },
    { value: 484, name: 'Union Ads' },
    { value: 300, name: 'Video Ads' }
]);

// 도넛 시리즈 데이터 생성
ECharts.createSeriesDonuts('도넛', [
    { value: 1048, name: 'Search Engine' },
    { value: 735, name: 'Direct2' },
    { value: 580, name: '띠따오지' },
    { value: 484, name: 'Union Ads' },
    { value: 300, name: 'Video Ads' }
]);


``` 
[기능 목록 보기](#기능목록)
<br>
