

const arrColors =  [
    '#65DEF1',
    '#A8DCD1',
    '#DCE2C8',
    '#F96900',
    '#B5EF8A',
    '#2274A5',
    '#F75C03',
    '#F1C40F',
    '#D90368',
    '#B2DFDB',
    '#59C3C3',
    '#52489C',
    '#EBEBEB',
    '#009688',
    '#00897B',
    '#00796B',
    '#00695C',
    '#004D40',
    '#A7FFEB',
    '#64FFDA',
    '#1DE9B6',
    '#00BFA5',
    '#E8F5E9',
    '#C8E6C9',
    '#A5D6A7',
    '#81C784',
    '#66BB6A',
    '#4CAF50',
    '#43A047',
    '#388E3C',
    '#2E7D32',
    '#1B5E20',
    '#B9F6CA',
    '#69F0AE',
]


class Search {
constructor() {
}
update() {
    this.from = document.getElementById('from').value;
    this.to = document.getElementById('to').value;
    this.municipality_concept_id = document.getElementById('locality-dropdown').value;
    this.occupation_field_concept_id = document.getElementById('occupationField').value;
    this.occupation_group_concept_id = document.getElementById('occupationGroup').value;
    
}
searchSummaryStr () {
    this.update();  
    let searchStr = '/summary/?';
    for (const [key, value] of Object.entries(this)) {
        if (!!value){
            searchStr += `&${key}=${value}`;
        }
    }
    return searchStr;
}
}
async function getArrayOfDates(skill,chart,querylistStr){
    
    
    var fromDate = new Date(document.getElementById('from').value)
    var toDate = new Date(document.getElementById('to').value)


    
    for (let index = 1,indexDate = new Date(fromDate); indexDate.getTime() <= toDate.getTime(); ) {

        indexDate.setMonth(indexDate.getMonth() + index);
        
        if(!labels.includes(indexDate.toLocaleString('default', { month: 'long', year: 'numeric' }))){
            
            labels.push(indexDate.toLocaleString('default', { month: 'long', year: 'numeric' }))
        }
    
    }
    
    for (let index = 1,indexDate = new Date(fromDate); indexDate.getTime() <= toDate.getTime(); ) {
     


        
        
        result = await fetch(`http://localhost:3001/list/${querylistStr}&skill=${encodeURIComponent(skill)}&from=${indexDate.getFullYear()}-${indexDate.getMonth()+1}-01&to=${indexDate.getFullYear()}-${indexDate.getMonth()+1}-27`)
        .then((response) => response.json())
        .then((responseData) => {
         
            for (var i=0, iLen=data.datasets.length; i<iLen; i++) { 

                if (data.datasets[i].label == responseData[0].skill) {
                    
                    data.datasets[i].data.push(responseData[0].total_vacancies)
                };
                chart.update()
            }
        })
        
        indexDate.setMonth(indexDate.getMonth() + index);
        
        
    }

    

}

async function taxSearch(searchStr, type) {
    const response = await fetch(`https://taxonomy.api.jobtechdev.se/v1/taxonomy/main/concepts?preferred-label=${searchStr}&type=${type}`, {});
    const json = await response.json();
 
    return json;
}




async function getStatistics(queryElement) {
 
    if (Chart.getChart('myChart')){
        Chart.getChart('myChart').destroy()
        
    }
    
    let myChart = new Chart(
        document.getElementById('myChart'),
        config
    );
 
    
    const chart = Chart.getChart("myChart");
    var queryStr = '?';
    var municipalityID = await taxSearch(document.getElementById('locality-dropdown').value,'municipality');
    
    queryStr += !!document.getElementById('regionInput').value ? '' : ''
    queryStr += !!document.getElementById('locality-dropdown').value ? `municipality_concept_id=${municipalityID[0]['taxonomy/id']}&` : '';
    queryStr += !!document.getElementById('occupationField').value ? `occupation_field_concept_id=${document.getElementById('occupationField').value}&` : '';
    queryStr += !!document.getElementById('occupationGroup').value ? `occupation_group_concept_id=${document.getElementById('occupationGroup').value}&` : '';
    var querylistStr = queryStr;
    queryStr += !!document.getElementById('from').value ? `from=${document.getElementById('from').value}&` : '';
    queryStr += !!document.getElementById('to').value ? `to=${document.getElementById('to').value}&` : '';
    
    result = await fetch(`http://localhost:3001/summary/${queryStr}`)
    .then((response) => response.json())
    .then((responseData) => {
        
        var el = document.getElementById('skillElement')
        el.innerHTML = ''
        
        data.datasets = [];
        
        var respnseDataIndex = 0;
        responseData.forEach(element => {
            getArrayOfDates(element.skill,chart,querylistStr)
            data.datasets.push({
                label: element.skill,
                backgroundColor: arrColors[respnseDataIndex],
                borderColor: arrColors[respnseDataIndex],
                data: [],
        })
            respnseDataIndex++;
            el.innerHTML += `<div class="col-6">${element.skill}</div><div class="col-6">${element.total_vacancies}</div>`;
        });

    })
    
}

var occupationFieldsAndGroups = {};

function showHideEle(selectSrc, targetEleId, triggerValue) {	
    var labelElementName = document.getElementById(targetEleId).getAttribute("name")
     var labelElements = document.getElementsByTagName("label")
    if(selectSrc.value!=triggerValue) {
        document.getElementById(targetEleId).style.display = "inline-block";
        getOccupationGroupInField(selectSrc,targetEleId)

     
     for (let index = 0; index < labelElements.length; index++) {
         if (labelElements[index].htmlFor === labelElementName) {
             labelElements[index].style.display = "inline-block";
         }

         
     }
    } else {
        for (let index = 0; index < labelElements.length; index++) {
         if (labelElements[index].htmlFor === labelElementName) {
             labelElements[index].style.display = "none";
         }

         
     }
        document.getElementById(targetEleId).style.display = "none";
    }
} 


fetch('assets/json.json',{
        method: 'GET'})
        .then(
            function(response) { 
                if (response.status !== 200) {  
                    console.warn('Looks like there was a problem. Status Code: ' + 
                        response.status);  
                    return;  
                }
            response.json().then(function(data) { 
                var occupationFieldElement = document.getElementById('occupationField');
                occupationFieldsAndGroups = data.data.concepts
                data.data.concepts.map(item => occupationFieldElement.innerHTML += `<option value=${item.id}>${item.preferred_label}</option>`)
            })   
            }
        )
    
function getOccupationGroupInField(OccuptionField,targetEleId){
    var targetEl = document.getElementById(targetEleId);
    var list = occupationFieldsAndGroups.find(obj => obj.id === OccuptionField.value);
    targetEl.innerHTML = '<option value="">Alla</option>'

    list.narrower.map(item => targetEl.innerHTML += `<option value=${item.id}>${item.preferred_label}</option>`)


}

function autoComplete(element, type) {
    arrayautolabels = [];
    arrautolabels = []
    fetch(`https://taxonomy.api.jobtechdev.se/v1/taxonomy/suggesters/autocomplete?query-string=${element.value}&type=${type}`,{
        method: 'GET'}) 
    .then(  
    function(response) {  
        
        if (response.status !== 200) {  
            console.warn('Looks like there was a problem. Status Code: ' + 
                response.status);  
            return;  
        }

        // Examine the text in the response  
        response.json().then(function(data) {  
            let option;
            listElement = element.list;
            listElement.innerHTML = "";
        for (let i = 0; i < data.length; i++) {
            
            
            listElement.innerHTML += `<option value="${data[i]['taxonomy/preferred-label']}">`
        }    
        });  
    }  


)  
.catch(function(err) {  
    console.error('Fetch Error -', err);  
});

}


