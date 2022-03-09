const Pagination = ({ items, pageSize, onPageChange }) => {
  const { Button } = ReactBootstrap;

  if (items >= 1) return null;
  let num = Math.ceil(items.length / pageSize);
  const pages = range(1, num);
  const list = pages.map((item) => {
    return (
      <Button key={item} onClick={onPageChange} className="btn btn-sm">
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
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
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
  const [query, setQuery] = useState("love");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    "http://openlibrary.org/subjects/love.json?",
    {
      works: [],
    }
  );
  const handlePageChange = (e) => {
    setCurrentPage(Number(e.target.textContent));
  };
  let page = data.works;
  if (page.length >= 1) {
    page = paginate(page, currentPage, pageSize);
    console.log(`currentPage: ${currentPage}`);
  }
  return (
    <Fragment>
      <form
        onSubmit={(event) => {
          doFetch(`http://openlibrary.org/subjects/${query}.json?`);
          event.preventDefault();
        }}
      >
        <input
          type="text"
          value={query}
          placeholder="subject"
          onChange={(event) => setQuery(event.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {isError && <div>Something went wrong ...</div>}

      {isLoading ? (
        <div>Loading ...</div>
      ) : (
        <ul className="list-group">
          {page.map((item, index) => (
            <li className="list-group-item" key={item.key}>
              <span className="title">{item.title}</span> by{" "}
              <span className="author">{item.authors[0].name}</span>
            </li>
          ))}
        </ul>
      )}
      <Pagination
        items={data.works}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      ></Pagination>
    </Fragment>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
