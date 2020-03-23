//ajax 取得資料
var xhr = new XMLHttpRequest();
xhr.open('GET','https://data.kcg.gov.tw/api/action/datastore_search?resource_id=92290ee5-6e61-456f-80c0-249eae2fcc97&limit=999',false);
xhr.send(null);
var records ;
// xhr.onload = function(){  
records = JSON.parse(xhr.responseText).result.records ;
// }

// 變數
var selectZone = document.querySelector('#selectZone');
var hotZoneArea = document.querySelector('.BtnGroup');
var hotZoneBtn = document.querySelectorAll('.hotZoneBtn');
var currentZone = document.querySelector('.currentZone');
var main = document.querySelector('.main');
var PageNumArea = document.querySelector('.PageNumArea');
// 控制每頁顯示幾筆資料
var OnePageDisplayNum = 6; 
var GoTopBtn = document.querySelector('.GoTopBtn a');
var currentPage = 1 ;
// init start
var getZone = [] ;
var hotZone = [] ;
var AllDataLen = records.length;  
for(var i = 0 ; i < AllDataLen ; i++){
  getZone[i] = records[i].Zone;  
  // console.log(records[i].Zone);  
}
getZone = Array.from(new Set(getZone));
// 利用抓出來的長度賦值
for(var i = 0 ; i < getZone.length ; i++){
  hotZone[i] = {count:0,name:''} ;
}
// 計算每個區出現次數
for(var i = 0 ; i < AllDataLen ; i++){
  for(var j = 0 ; j < getZone.length ; j++){
    if(records[i].Zone == getZone[j]){
      // console.log(hotZone[j]);      
      hotZone[j].count += 1 ;
      hotZone[j].name = getZone[j] ;
    }
  }
}
// 排序出現最多次的zone
hotZone.sort(function (a, b) {
  return b.count - a.count;
});
// hotZone = 資料中出現前4名多的zone
hotZone.splice(4,hotZone.length);

// SET SELECT項目
var str = '<option>----請選擇行政區----</option>' ;
for(var i = 0 ; i < getZone.length ; i++){
  str += '<option value = '+ getZone[i] +'>'+getZone[i]+'</option>';
}
selectZone.innerHTML = str;

// SET hotZoneBtn
for(var i = 0 ; i < hotZoneBtn.length ; i++){
  hotZoneBtn[i].textContent = hotZone[i].name;  
}

// init end

// 監聽
hotZoneArea.addEventListener('click',updateInfo);
selectZone.addEventListener('change',updateInfo);
// 監聽頁碼更換
PageNumArea.addEventListener('click',changePage);
// 更新資料
function updateInfo(e){  
  e.preventDefault();
  var currentSelect = e.target.value || e.target.textContent;
  if(currentSelect=='----請選擇行政區----'){
    alert('請選擇有效行政區！');
    return
  }
  // 限制只能點擊button、select
  if(e.target.nodeName !== 'BUTTON' && e.target.nodeName !== 'SELECT'){return}
  // 若用hotZone的Button選擇、把select改回預設
  if(e.target.nodeName =='BUTTON'){
    selectZone.value = '----請選擇行政區----';
  }  
  // 更新現在選擇的zone
  currentZone.textContent = currentSelect;
  
  // 更新infoarea
  var string = '';
  var countZoneNum = 0;
  for(var i = 0 ; i < AllDataLen ; i++){
    if(records[i].Ticketinfo == ''){
      records[i].Ticketinfo ="無門票資訊";
    }
    // 列出當前選擇區域的資料
    if (records[i].Zone == currentSelect){      
      string += '<div class="infoarea" data-number='+countZoneNum+'><div class="picture" style=\"background-image:linear-gradient(transparent, rgba(0,0,0,.3)),url('+records[i].Picture1
      +')\"><h2>'+records[i].Name+'</h2><h3>'+currentSelect+'</h3></div><div class="info"><p><img src="./img/icons_clock.png">'+
      records[i].Opentime+'</p><p><img src="./img/icons_pin.png">'+records[i].Add+'</p><p class=\'phone\'><img src="./img/icons_phone.png">'+
      records[i].Tel+'</p><p class="ticket"><img src="./img/icons_tag.png">'+records[i].Ticketinfo+'</p></div></div>';
      countZoneNum +=1 ;
    }
  }
  main.innerHTML = string;
  // console.log('countZoneNum:'+countZoneNum);
  GoTopBtn.setAttribute('style','display:block;');
  paginationInit(countZoneNum);
}
// 頁碼init
function paginationInit(ZoneNum){
  // 每產生一次頁碼就重製currentPage
  currentPage = 1;
  var SelectZonePageNum = Math.ceil(ZoneNum / OnePageDisplayNum);
  var infoarea = document.querySelectorAll('.infoarea');
  // 顯示第一頁，隱藏第一頁之後的結果
  for(var i = OnePageDisplayNum ; i < ZoneNum ; i++){
    infoarea[i].setAttribute('style','display : none ;');
  };
  // 組頁碼字串
  var string = '<a href="#" data-pageNum="0">Prev</a>' ;
  for(var j = 1 ; j <= (SelectZonePageNum) ; j++){
    string += '<a href="#" data-pageNum="'+j+'">'+j+'</a>';
  };
  string += '<a href="#" data-pageNum="-1">Next</a>' ;
  PageNumArea.innerHTML = string;
  // 要是結果只有一頁，把next按鈕也禁用
  var PageNumArea_pageNum = document.querySelectorAll('.PageNumArea a');
  if(SelectZonePageNum == 1){    
    var getNextNumber = SelectZonePageNum+1; 
    PageNumArea_pageNum[getNextNumber].setAttribute('class','disable');
  }   
  PageNumArea_pageNum[0].setAttribute('class','disable'); 
  PageNumArea_pageNum[1].setAttribute('class','active');
  // console.log(PageNumArea.innerHTML);  
  // console.log(SelectZonePageNum , RemainderInfo , infoarea);
}
// 頁碼更換
function changePage(e){
  e.preventDefault();
  if(e.target.nodeName != 'A'){return}
  // 現在點選的頁碼
  var ClickedNum = parseInt(e.target.dataset.pagenum);
  var infoarea = document.querySelectorAll('.infoarea');
  var PageNumArea_pageNum = document.querySelectorAll('.PageNumArea a');
  
  // 資料長度
  var ZoneNum = infoarea.length ;
  // 頁碼長度
  var AllPageNum = PageNumArea_pageNum.length;
  // console.log("全部頁碼 :"+AllPageNum);
  // console.log("現在頁碼 :"+currentPage);
  // 資料量與一頁顯示數量的餘數
  var RemainderInfo = ZoneNum % OnePageDisplayNum ;

  // 判斷點選是否為當前頁、最前頁或最後頁，若已經是最前或最後頁，加上disable
  if(ClickedNum == 0 && currentPage == 1){
    PageNumArea_pageNum[0].setAttribute('class','disable');
    return
  }
  else if(ClickedNum == -1 && currentPage == (AllPageNum - 2)){
    PageNumArea_pageNum[(AllPageNum - 1)].setAttribute('class','disable');
    return
  }
  // 先隱藏全部的結果
  for(var i = 0 ; i < ZoneNum ; i++){
    infoarea[i].setAttribute('style','display : none ;');
  };
  // 先重置所有頁碼樣式
  for(var i = 0 ; i < AllPageNum ; i++){
    PageNumArea_pageNum[i].setAttribute('class','init');
  }
  // 最後一頁不一定整除一頁列出的數量，另外渲染 
  if(ClickedNum == (AllPageNum - 2) && RemainderInfo != 0){
    currentPage = ClickedNum ;
    // console.log(currentPage);       
    for(var i = 0 ; i < RemainderInfo ; i++){    
      // console.log('最後一頁:'+(ZoneNum-i-1));  
      infoarea[(ZoneNum-i-1)].setAttribute('style','display:block;');
    }
    PageNumArea_pageNum[currentPage].setAttribute('class','active');
  }
  // 當前點擊不是prev、next、並且點擊 大於 現在在的頁碼
  if(ClickedNum != 0 && ClickedNum != -1 && ClickedNum > currentPage){
    currentPage = ClickedNum ;
    for(var i = 0 ; i < OnePageDisplayNum ; i++){
      // console.log('點擊大於現在的項目號碼:'+((currentPage*OnePageDisplayNum)-(i+1)));
      infoarea[((currentPage*OnePageDisplayNum)-(i+1))].setAttribute('style','display:block;');
    }    
    PageNumArea_pageNum[currentPage].setAttribute('class','active');
  }
  // 當前點擊不是prev、next、並且點擊 小於 現在在的頁碼
  else if(ClickedNum != 0 && ClickedNum != -1 && ClickedNum < currentPage){
    currentPage = ClickedNum ;
    for(var i = 0 ; i < OnePageDisplayNum ; i++){
      
      // console.log('點擊小於現在的項目號碼:'+((currentPage*OnePageDisplayNum)-(i+1)));
      infoarea[((currentPage*OnePageDisplayNum)-(i+1))].setAttribute('style','display:block;');
    }
    PageNumArea_pageNum[currentPage].setAttribute('class','active');
  }
  // 點擊prev
  if(ClickedNum == 0){
    currentPage -=1 ;
    for(var i = 0 ; i < OnePageDisplayNum ; i++){
      // console.log('點擊prev:'+((currentPage*OnePageDisplayNum)-(i+1)));
      infoarea[((currentPage*OnePageDisplayNum)-(i+1))].setAttribute('style','display:block;');
    }
    PageNumArea_pageNum[currentPage].setAttribute('class','active');
  }
  // 點擊next、最後一頁不一定整除一頁列出的數量，另外渲染
  else if(ClickedNum == -1 && RemainderInfo != 0 && (currentPage+1)==(AllPageNum-2)){
    currentPage +=1 ;
    // console.log(currentPage);       
    for(var i = 0 ; i < RemainderInfo ; i++){    
      // console.log('最後一頁:'+(ZoneNum-i-1));  
      infoarea[(ZoneNum-i-1)].setAttribute('style','display:block;');
    }
    PageNumArea_pageNum[currentPage].setAttribute('class','active')
  }
  else if (ClickedNum == -1){
    currentPage +=1 ;
    for(var i = 0 ; i < OnePageDisplayNum ; i++){
      // console.log('點擊next:'+((currentPage*OnePageDisplayNum)-(i+1)));
      infoarea[((currentPage*OnePageDisplayNum)-(i+1))].setAttribute('style','display:block;');
    }
    PageNumArea_pageNum[currentPage].setAttribute('class','active');
  }
  
  // console.log("點擊後現在頁碼 :"+currentPage);
}
// 監聽回到頁面上方
GoTopBtn.addEventListener('click',function(e){
  e.preventDefault();
  document.documentElement.scrollTop = 0 ;
});