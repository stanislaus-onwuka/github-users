// Query Selectors
const searchInput = document.querySelector("#search-input-value");
const searchForm = document.querySelector("#search-form");
const clearSearchBtn = document.getElementById("clear-search-btn");
const searchResults = document.getElementById("search-results");


// Constants and variables
const githubUrl = 'https://api.github.com/graphql';

const query = 
    `query SearchUsers($queryString: String!){
        search(query: $queryString, type: USER, first: 5) {
            repositoryCount
            edges {
                node {
                    ... on User {
                        id
                        avatarUrl
                        login
                        name
                    }
                }
            }
        }
    } 
`;

let filteredResults = [];


const searchUsers = async (e)=> {

    e.preventDefault();

    const fetchToken = await fetch("https://github-users-buycoins.netlify.app/.netlify/functions/getToken");

    let tokenValue = await fetchToken.text()

    axios.post(
        githubUrl,
        { 
            query: query,
            variables: { "queryString": JSON.stringify(searchInput.value)}
        }, 
        {headers:{
            "Authorization": `Bearer ${tokenValue}`,
            'Content-Type': 'application/json',
        }}
    )
    .then(function (response) {
        console.log(response)
        console.log(fetchToken)

        const { edges } = response.data.data.search
        const searchResultList = document.createElement("ul");
   

        if(edges.length > 0){
            filteredResults= edges.filter(result=>{return result.node.login.toLowerCase().match(new RegExp(searchInput.value,"g"))});
            
            console.log(filteredResults)

            filteredResults.map((result)=>{
                let { id,avatarUrl,login,name } = result.node;

                const searchResultListItem = document.createElement("li");
                searchResultListItem.setAttribute("id",id);
                searchResultListItem.setAttribute("class","search-result");
                searchResultListItem.addEventListener("click",()=>storeSearchResult(login));

                const searchResultListItemLink = `
                    <a href="/userpage.html" class="search-result">
                        <div class="avatar">
                            <img src="${avatarUrl}"/>
                        </div>
                        <div class="user">
                            <h3 class="name">${name}</h3>
                            <p class="login">${login}</p>
                        </div>
                    </a>
                `
                searchResultListItem.innerHTML = searchResultListItemLink
                searchResultList.appendChild(searchResultListItem)
            })
            searchResults.appendChild(searchResultList)
            
        }else if(edges.length === 0){
            searchResults.innerHTML = `<p class="no-results">No results found</p>`
        }
        
    })
    .catch(function (error) {
        console.log(error);
    });

    
}

// Send search request
searchForm.addEventListener("submit", (e)=>searchUsers(e))


searchInput.addEventListener("keypress", (e)=>{
    e.preventDefault();
    if (e.key === "enter") {
        searchUsers(e);
    }
})



// Storing selected result
const storeSearchResult = (id) =>{
    sessionStorage.setItem("user",JSON.stringify(id))
}


// Show clear btn
searchInput.addEventListener('click',()=>{
    clearSearchBtn.style.display = "block"
})



// Clear input state and remove clear btn
clearSearchBtn.addEventListener('click',(e)=>{

    e.preventDefault();

    searchForm.reset();
    searchInput.value = null;

    // Clear results
    searchResults.textContent = ""


    while(searchResults.lastChild){
        searchResults.removeChild(searchResults.lastChild);
    }

    filteredResults = [];

    clearSearchBtn.style.display = "none";
})

