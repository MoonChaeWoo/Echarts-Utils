/**
 * @description ehcarts를 쉽게 생성, 초기화, 조작하기 위한 사용자 정의 유틸리티 클래스
 *              다음과 같은 주요 기능들을 제공한다.
 *                - [instance] 차트 완전 삭제, 데이터 변경, echart 실제 객체 리턴
 *                  -> destroy, updateSeriesData, chart
 * 
 *                - [instance] 이벤트 (클릭, 더블클릭 등) 추가 및 삭제 그리고 조회
 *                   -> on, off, findEventList
 * 
 *                - [instance] 부모 요소 크기 변화 시 resize 기능 (❇︎ echarts에서 기본으로 제공 되지 않음)
 *                   -> startResizeObserver, stopResizeObserver
 * 
 *                - [static/instance] 여러개 차트를 그룹으로 묶어 마우스 호버 등 사용자 상호작용을 동시에 되도록 동기화 기능 추가/제거 및 그룹명조회
 *                   -> chartSyncConnect, chartSyncDisConnect, getGroupName
 * 
 *                - [static] 기본 옵션 생성 메소드, 테마 설정
 *                   -> generateDefaultOption, fetchResisterTheme
 * 
 *                - [static] series(data)의 타입 별(line, bar, circle, boxplot, donuts) 생성 메소드
 *                   -> createSeriesLine, createSeriesBar, createSeriesBoxPlot, createSeriesPie, createSeriesDonuts
 * 
 * @author      tyche0529
 * @copyright   2025 tyche0529@naver.com
 * @license     MIT
 * 
 * @see         https://echarts.apache.org 공식 사이트 URL
 * @see         https://echarts.apache.org/en/api.html#echarts Document API URL
 * @see         https://echarts.apache.org/en/theme-builder.html echarts 테마 커스터마이징 및 다운로드 URL
 */

class ECharts{
    #_chart;
    #_resizeObserve = null;
    #_targetElement;
    #_targetElementId;
    #_eventList = [];

    constructor(targetElementId, userOption = {}, series = {}, theme){
        this.#_targetElementId = targetElementId;
        this.userOption = userOption;
        this.series = series;
        this.theme = theme;

        this.init();
    }

    init(){
        this.#_targetElement = document.querySelector(`#${this.#_targetElementId}`);
        if(!this.#_targetElement){
            console.error(`${this.#_targetElement} ID를 가진 Element를 찾을 수 없습니다.`);
            return;
        }

        // 차트 인스턴스 생성
        this.#_chart = echarts.init(this.#_targetElement, this.theme);

        // 차트 옵션 설정
        this.#_chart.setOption({...this.userOption, series : this.series.flat(Infinity)});
    }

    // ECharts 인스턴스로부터 echart의 chart객체 불러오기
    get chart(){
        return this.#_chart;
    }

    // EChart 인스턴스 후 chart 객체 변경 방지
    set chart(_){
        console.warn('ECharts 인스턴스의 chart 객체 변경은 불가능합니다.');
        return;
    }

    get targetElement(){
        return this.#_targetElement;
    }

    set targetElement(_){
        console.warn('ECharts 인스턴스의 target element 변경은 불가능합니다.');
        return;
    }

    get targetElementId(){
        return this.#_targetElementId;
    }

    set targetElementId(_){
        console.warn('ECharts 인스턴스의 target element id 변경은 불가능합니다.');
        return;
    }


    // 등록된 이벤트 목록 조회
    // 참고 - description이 작성되어있으면 이벤트 이름이 같아도 찾기 쉬움
    get eventList(){
        return this.#_eventList;
    }

    set eventList(_){
        console.warn('ECharts 인스턴스의 target element event 변경은 직접 불가능합니다.');
        console.warn('on과 off 메소드를 이용하시면 자동으로 관리됩니다.');
        return;
    }

    // chart 완전 삭제
    destroy(){
        this.stopResizeObserver();
        this.#_chart.dispose();
    }

    findEventList({eventType, callback, description}){
        return this.#_eventList.find(event => (
            [
                eventType    ? event.eventType    === eventType    : true,
                callback     ? event.callback     === callback     : true,
                description  ? event.description  === description  : true
            ].every(Boolean)
        ));
    }

    /* 
    이벤트 추가
        지원하는 이벤트 예
        click
        dblclick
        mouseover
        mouseout
        legendselectchanged
        datazoom
        timelinechanged
        geoselectchanged
    */
    on(eventType, callback, description){
        const func = function(params){callback(params)};
        this.#_eventList.push({
            eventType,
            callback : func,
            description
        })
        this.#_chart.on(eventType, func);
    }

    /* 
        이벤트 삭제
    */
    off(eventType, callback){
        this.#_chart.off(eventType, callback);
        this.#_eventList = this.#_eventList.filter(event => event.eventType !== eventType && event.callback !== callback);
    }

    // 타켓 요소 크기가 바뀌면 차트도 리사이즈 비활성화
    stopResizeObserver(){
        if(this.#_resizeObserve){
            this.#_resizeObserve.disconnect();
            this.#_resizeObserve = null;
        }
    }

    // 타켓 요소 크기가 바뀌면 차트도 리사이즈 활성화
    startResizeObserver(){
        if(!this.#_resizeObserve){
            this.#_resizeObserve = new ResizeObserver((entries) => {
                this.#_chart.resize();  
            });
            this.#_resizeObserve.observe(this.#_targetElement);
        }
    }

    // 차트 그룹 이름
    getGroupName(){
        return this.#_chart.group;
    }

    // 차트 값 업데이트 - notMerge : 일부 변경(false), 완전변경(true)
    updateSeriesData(newDataArray, notMerge = false){
        if(!newDataArray.length){
            console.error("업데이트할 값이 없습니다.");
            return;
        }

        this.#_chart.setOption({
            series : newDataArray.flat(Infinity)
        }, notMerge)
    }

    // chart 인스턴스에서 바로 액션 동기화
    chartSyncConnect(chartsInstance = [], groupName = Symbol('chartSync')){
        try{
            if(chartsInstance.length < 1) new Error("서로 액션을 동기화할 차트객체를 1개 이상 배열에 담아 넣으세요.");
            this.constructor.chartSyncConnect([...chartsInstance, this.#_chart]);
        }catch(e){
            console.error("오류 발생:", e.message);
            console.error("오류 스택:", e.stack);
            return;
        }
    }

    // chart 인스턴스에서 바로 액션 동기화 연결해제
    chartSyncDisConnect(...groupName){
        if(groupName.length) this.constructor.chartSyncDisConnect(...groupName);
        else this.constructor.chartSyncDisConnect(this.getGroupName());
    }

    // 테마 설정
    static async fetchResisterTheme(resourceUrl, themeName){
        themeName = themeName ? themeName : resourceUrl.split('/').slice(-1)[0].replace('.json', '');

        try{
            const resopnse = await fetch(resourceUrl);
            if(!resopnse.ok) throw new Error(`테마 json 파일 download 실패 - 상태 코드: ${resopnse.status}`);
            const themeJson = await resopnse.json();
            echarts.registerTheme(themeName, themeJson);
            return themeName;
        }catch(e){
            console.error("테마 오류 발생:", e.message);
            console.error("테마 오류 스택:", e.stack);
        }
    }

    // chart 액션 동기화 연결
    static chartSyncConnect(chartsInstance = [], groupName = Symbol('chartSync')){
        try{
            if(!chartsInstance.length) new Error("서로 액션을 동기화할 차트객체를 2개 이상 배열에 담아 넣으세요.");

            chartsInstance.forEach(instance => {
                const charts = instance instanceof ECharts ? instance.chart : instance;
                charts.group = groupName;
            });
            echarts.connect(groupName);
        }catch(e){
            console.error("오류 발생:", e.message);
            console.error("오류 스택:", e.stack);
            return;
        }
    }

    // chart 액션 동기화 연결해제
    static chartSyncDisConnect(...groupName){
        if(groupName.length === 0) {
            console.error('연결을 해제할 그룹 이름 또는 ECharts 객체를 인자값으로 넣어합니다.');
            return;
        }else{
            groupName.flat(Infinity).forEach(name => {
                if(name instanceof ECharts) {
                    echarts.disconnect(name.getGroupName());
                }else if(typeof name === 'string' || typeof name === 'symbol'){
                    echarts.disconnect(name);
                }
            });
        }
    }

    // chart 생성 시 옵션
    static generateDefaultOption(){
        const defaultOption = {
            // 차트의 제목 관련 설정
            title: {
                text: '메인 제목 텍스트',       // 메인 제목 텍스트
                subtext: '부제목 (선택 사항)',  // 부제목 (선택 사항)
                left: 'center'              // 제목 위치 ('left', 'center', 'right')
            },

            /*
                마우스 오버 시 툴팁 표시 설정
                trigger
                    'item': 마우스를 데이터 점(막대, 선, 점)에 올렸을 때만 툴팁 표시
                    'axis': 마우스를 x/y축을 기준으로 움직일 때 해당 축의 모든 시리즈 값을 동시에 표시
                    → 캔들차트, 라인차트 같이 여러 시리즈를 묶어서 볼 때 사용
                    'none': 툴팁 비활성화
                axisPointer
                    축 위에 표시되는 보조선이나 영역
                    마우스 움직임에 따라 축 값의 위치를 가리켜 줌
                type (axisPointer.type)
                    'line': 한 줄 가이드 (x축이나 y축 방향)
                    'shadow': 영역 가이드 (막대형 차트에서 주로 사용)
                    'cross': 십자 모양 가이드 (x축 + y축 동시에 표시)
                    'none': 표시 안 함
            */
            tooltip: {
                trigger: 'item',             // 'item' | 'axis' | 'none' (축 기준 툴팁 표시), 툴팁 표시 방식

                // axisPointer: {               // 축 포인터(가이드 라인) 설정
                //     type: 'cross'            // 포인터 모양
                // },

                /*
                    formatter -  마우스 호버 시 이벤트 커스텀화 시 사용
                    ◎ 주의사항 axisPointer 옵션이 axis, item일 경우 값의 형태가 다름
                */
                // formatter(params) {
                //     const data = params[0].data;
                //     return [
                //     '날짜: ' + params[0].name,
                //     '시가: ' + data[0],
                //     '종가: ' + data[1],
                //     '최저: ' + data[2],
                //     '최고: ' + data[3]
                //     ].join('<br/>');
                // }
            },

            // 범례 설정 (시리즈 이름 표시)
            legend: {
                // data: ['범례 항목'],          // 범례 항목 (series.name과 일치)
                // top: 'bottom'               // 위치 설정 (top, bottom, left, right, center 등)
            },

            // X축 설정
            xAxis: {
                // x축 데이터가 범주형 - 'category', 수치형 - 'value'
                type: 'category',

                // x축 레이블 목록
                data: [],

                // x축 레이블 이름 회전 각도 (가독성 개선)
                axisLabel: { rotate: 0 }
            },

            // Y축 설정
            yAxis: {
                type: 'value'               // 수치형 축
            },

            // 시리즈 데이터 (실제 그래프의 주체)
            //series는 원래 여기에서 정의를 하나 Echarts에서는 init()에서 series(data)를 넣음
            /*
            series 형태 예시
                [
                    {
                        name: 'data 수치 이름',      // 범례와 툴팁에 표시될 이름
                        type: 'bar',              // 'bar', 'line', 'pie', 'candlestick'등
                        data: [5, 20, 36, 10, 10] // y축 값 (x축 레이블과 순서 일치)
                    }
                ]
            */
        };
        return defaultOption;
    }

    // Line 그래프 시리즈 데이터
    // ex : data: [150, 230, 224, 218, 135, 147, 260]
    static createSeriesLine(name = 'Insert line name', data = []){
        return [{
            name,
            type : 'line',
            data
        }]
    }

    // Bar 그래프 시리즈 데이터
    // ex : data: [150, 230, 224, 218, 135, 147, 260]
    static createSeriesBar(name = 'Insert bar name', data = []){
        return [{
            name,
            type : 'bar',
            data
        }]
    }

    // boxplot 그래프 시리즈 데이터
    // 데이터 순서는 [Q1, Q3, min, max], (Q1 : 25%, Q3 : 75%)
    // ex : data: [
    //     [20, 34, 10, 38],
    //     [38, 15, 5, 42],
    // ]
    static createSeriesBoxPlot(name = 'Insert boxplot name', data = []){
        return [{
            name,
            type : 'candlestick',
            data
        }]
    }

    // Pie 그래프 시리즈 데이터
    // data: [
    //     { value: 1048, name: 'Search Engine' },
    //     { value: 735, name: 'Direct' }
    // ]
    static createSeriesPie(name = 'Insert pie name', data = [], option = {}){
        return [{
            name,
            type : 'pie',
            radius : '50%',
            data,
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            },
            ...option
        }];
    }

    // Donuts 그래프 시리즈 데이터
    // data: [
    //     { value: 1048, name: 'Search Engine' },
    //     { value: 735, name: 'Direct' }
    // ]
    static createSeriesDonuts(name = 'Insert donuts name', data = [], option = {}, cornerRounding = true){
        return [
            {
                name,
                type: 'pie',
                radius: ['40%', '70%'], // 원형차트 안쪽 크기, 원형차트 바깥쪽 크기
                avoidLabelOverlap: true,
                itemStyle: cornerRounding ? {
                    borderRadius: 10,
                    borderColor: '#fff',
                    borderWidth: 2
                } : {},
                label: {
                    show: false,
                    position: 'center'
                },
                emphasis: {
                    label: {
                    show: true, // 호버 시 안쪽에 라벨을 보여줄 것인지
                    fontSize: 20,
                    fontWeight: 'bold'
                    }
                },
                labelLine: {
                    show: false
                },
                data,
                ...option
            }
        ]
    }
}