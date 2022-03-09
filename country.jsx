const Pagination = ({ items, pageSize, onPageChange }) => {
  // Part 2 code goes here
  const { Button } = ReactBootstrap;

  if (items >= 1) return null;
  let num = Math.ceil(items.length / pageSize);
  const pages = range(1, num + 1);
  const list = pages.map((item) => {
    return (
      <Button key={item} onClick={onPageChange} className="page-item">
        {item}
      </Button>
    );
  });
  return (
    <nav>
      <ul>{list}</ul>
    </nav>
  );
};

const range = (start, end) => {
  return Array(end - start + 1)
    .fill(0)
    .map((item, i) => start + i);
};

function paginate(items, pageNumber, pageSize) {
  const start = (pageNumber - 1) * pageSize;
  let page = items.slice(start, start + pageSize);
  return page;
}

const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });

  useEffect(() => {
    let didCancel = false;
    const fetchData = async () => {
      // Part 1, step 1 code goes here
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        console.log(result);
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};

const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};

function App() {
  const { Fragment, useState, useEffect, useReducer } = React;
  const [query, setQuery] = useState("canada");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    `https://restcountries.com/v3.1/continent/europe`,
    [{ name: {} }]
  );
  console.log(data);
  const handlePageChange = (e) => {
    setCurrentPage(Number(e.target.textContent));
  };
  let page = data;
  if (page.length >= 1) {
    page = paginate(page, currentPage, pageSize);
    console.log(`currentPage: ${currentPage}`);
  }

  return (
    <Fragment>
      {isLoading ? (
        <div>Loading ...</div>
      ) : (
        <ul className="list-group">
          {page.map((item) => (
            <li className="list-group-item" key={item.key}>
              <article className={data.name}>
                <img className="country__img" src={data.flags.png} />
                <div className="country__data">
                  <h3 className="country__name">{data.name.common}</h3>
                  <h4 className="country__region">{data.region}</h4>
                  <p className="country__row">
                    <span>👫</span>
                    {(+data.population / 1000000).toFixed(1)}
                  </p>
                  <p className="country__row">
                    <span>🗣️</span>
                    {data.languages[0]}
                  </p>
                  <p className="country__row">
                    <span>💰</span>
                    {data.currencies[Object.keys(data.currencies)[0]].name}
                  </p>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
      <Pagination
        items={data}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      ></Pagination>
    </Fragment>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
