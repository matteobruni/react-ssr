import React, {useCallback, useContext, useEffect, useMemo, useState} from 'react';
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import {db} from "../../../firebase_config";
import {useHistory, useLocation} from "react-router-dom";
import {Add, ChevronRight, KeyboardArrowDown, MoreHoriz} from "@material-ui/icons";
import CMSLogRowItem from "./cms-log-row-item";
import InfiniteScroll from "../../../components/global/infinite-scroll";
import CMSLogRowHeaderItem from "./cms-log-row-header-item";
import Menu from '@material-ui/core/Menu';
import {ThemeContext} from "../../../context";
import {SessionFormSelect} from "../../../components/livesessions/sessionform-input";
import PustackShimmer from "../../../components/global/shimmer";
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import useInstructors from "../../../hooks/instructors";
import {InputLabel, MenuItem, Select} from "@material-ui/core";
import {useMediaQuery} from "react-responsive";
import CMSLogFilter from "./cms-log-filter";
import {fetchIndianTime, getIndianTime} from "../../../helpers";
import useQuery from "../../../hooks/query/useQuery";

const dateRanges = [
  {id: 1, label: 'Last Week', value: 8},
  {id: 2, label: 'Last 30 Days', value: 31},
  {id: 3, label: 'Last 2 Months', value: 61},
  {id: 4, label: 'All Time', value: -1},
  {id: 5, label: 'Yesterday', value: 2, notRange: true},
  {id: 6, label: 'Today', value: 1, notRange: true},
]

export default function CMSLog() {
  const isSmallScreen = useMediaQuery({ query: "(max-width: 500px)" });
  const history = useHistory();
  const [logs, setLogs] = useState(null);
  const [noMoreLogs, setNoMoreLogs] = useState(false);
  const [sortData, setSortData] = useState({key: 'timestamp', asc: false});
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [isDark] = useContext(ThemeContext).theme;
  const [dateRange, setDateRange] = useState(dateRanges[3].value)
  const [filters, setFilters] = useState([]);
  const query = useQuery();

  useEffect(() => {
    console.log('query - ', query);
    const key = query.get('key');
    const value = query.get('value');
    const label = query.get('label') ?? value;

    if(!key || !value) {
      return fetchAllLogs();
    }

    handleFilterSearch([{key, value, label}]);

  }, [query]);

  function fetchAllLogs() {
    setLogs(null);
    db.collection('cms_logs')
      .limit(20)
      .orderBy(sortData.key, sortData.asc ? "asc" : "desc")
      .get()
      .then(snapshot => {
        let arr = [];
        snapshot.docs.forEach(doc => {
          arr.push({item: doc, ...doc.data()});
        });
        // console.log('snapshot.docs - ', arr);
        setLogs(arr);
      })
    setNoMoreLogs(false);
  }

  const handleDateChange = async (dateRange) => {
    setLogs(null);
    let ref = db.collection('cms_logs')
      .orderBy('timestamp', 'desc')

    const rangeObj = dateRanges.find(c => c.value === dateRange);

    if(!rangeObj) return;

    if(!(dateRange < 0)) {
      let date = await fetchIndianTime();

      if(rangeObj.notRange) {
        date.setDate(date.getDate() - (dateRange - 1));
        date.setHours(0);
        date.setMinutes(0);
        let startAt = date.getTime();
        date.setHours(23);
        date.setMinutes(59);
        let endAt = date.getTime();
        // ref = ref.startAt(startAt);
        // ref = ref.endAt(endAt);
        console.log('startAt - ', startAt);
        console.log('endAt - ', endAt);
        ref = ref.where('timestamp', '<=', endAt);
        ref = ref.where('timestamp', '>=', startAt);
      } else {
        date.setDate(date.getDate() - dateRange);
        ref = ref.endAt(date.getTime());
      }

    }

    console.log(' date - ', )

    ref = addFilters(ref);

    ref
      .limit(20)
      .get()
      .then(snapshot => {
        let arr = [];
        snapshot.docs.forEach(doc => {
          arr.push({item: doc, ...doc.data()});
        });
        // console.log('snapshot.docs - ', arr);
        setLogs(arr);
      })
    setNoMoreLogs(false);
  }

  const fetchMoreLogs = useCallback(async () => {
    console.log('fetch More - ', logs);
    if (!logs || !logs.length > 0 || logs.length < 20) {
      setNoMoreLogs(true)
      return;
    };
    let ref = db.collection('cms_logs')
      .limit(20)
      .orderBy('timestamp', 'desc')

    const rangeObj = dateRanges.find(c => c.value === dateRange);

    if(!rangeObj) return;

    if(!(dateRange < 0)) {
      let date = await fetchIndianTime();

      if(rangeObj.notRange) {
        date.setDate(date.getDate() - (dateRange - 1));
        date.setHours(0);
        date.setMinutes(0);
        let startAt = date.getTime();
        date.setHours(23);
        date.setMinutes(59);
        let endAt = date.getTime();
        // ref = ref.startAt(startAt);
        // ref = ref.endAt(endAt);
        console.log('startAt - ', startAt);
        console.log('endAt - ', endAt);
        ref = ref.where('timestamp', '<=', endAt);
        ref = ref.where('timestamp', '>=', startAt);
      } else {
        date.setDate(date.getDate() - dateRange);
        ref = ref.endAt(date.getTime());
      }

    }

    // if(!(dateRange < 0)) {
    //   let date = new Date();
    //   date.setDate(date.getDate() - dateRange);
    //   ref = ref
    //     .orderBy('timestamp', 'desc')
    //     .endAt(date.getTime())
    // } else {
    //   ref = ref
    //     .orderBy(sortData.key, sortData.asc ? "asc" : "desc");
    // }

    ref = addFilters(ref);

    return ref
      .startAfter(logs.at(-1).item)
      .get()
      .then((snapshot) => {
        const requests = [];
        snapshot.docs.map((item) =>
          requests.push({item, ...item.data()})
        );
        setLogs(c => [...c, ...requests]);
        setNoMoreLogs(!(requests.length > 0 && requests.length >= 10));
      })
      .catch(e => console.log(e));
  }, [logs, sortData, dateRange, filters])

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const addFilters = (ref, argFilters) => {
    let latestFilters =  argFilters || filters;

    let itemId = latestFilters.find(c => c.key === 'item_id');

    if(itemId) {
      ref = ref.where('item_id', '==', itemId.value);
      return ref;
    }

    let actions = latestFilters.filter(c => c.key === 'action');
    let actionValues = actions.map(a => a.value);

    if(actions.length > 0) {
      ref = ref.where('action', 'in', actionValues);
    }

    let levels = latestFilters.filter(c => c.key === 'level');
    let levelValues = levels.map(a => a.value);

    if(actions.length === 0 && levels.length > 0) {
      ref = ref.where('level', 'in', levelValues);
    }

    let instructors = latestFilters.filter(c => c.key === 'requested_by_id');
    let instructorValues = instructors.map(a => a.value);

    if(actions.length === 0 && levels.length === 0 && instructors.length > 0) {
      ref = ref.where('requested_by.id', 'in', instructorValues);
    }

    let affectedKeys = latestFilters.filter(c => c.key === 'affected_keys_list');
    let affectedKeyValues = affectedKeys.map(a => a.value);

    if(actions.length === 0 && levels.length === 0 && instructors.length === 0 && affectedKeys.length > 0) {
      ref = ref.where('affected_keys_list', 'array-contains-any', affectedKeyValues);
    }

    return ref;
  }

  const handleFilterSearch = (argFilters) => {
    handleClose();
    setDateRange(-1);
    setLogs(null);
    setFilters(argFilters);
    let ref = db.collection('cms_logs')
      .orderBy('timestamp', 'desc')

    ref = addFilters(ref, argFilters);

    ref.limit(20)
      .get()
      .then(snapshot => {
        let arr = [];
        snapshot.docs.forEach(doc => {
          arr.push({item: doc, ...doc.data()});
        });
        setLogs(() => {
          setNoMoreLogs(false);
          return arr;
        });
      })
  }

  return (
    <>
      <InfiniteScroll
        initialized={logs !== null}
        className="cms-content-infinite"
        fetchMoreFn={fetchMoreLogs}
        noMore={noMoreLogs}
        noMoreText={""}
        loadingText={"Loading more logs..."}
      >
        <div className="cms-content-header log">
          <div>
            <ArrowBackIcon onClick={() => history.push('/cms')} />
            <h2>Activity Log</h2>
          </div>
        </div>
        <div className="cms-content-log-section">
          <div className="cms-content-log-section-header">
            <SessionFormSelect
              // invalid={showError && form.errors['access_tier']}
              id={'select-date'}
              className="select-date-filter"
              placeholder="Session Access Tier"
              items={dateRanges}
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value)
                handleDateChange(e.target.value);
              }}
            />
            <input type="text" placeholder="Search by item id..." onKeyPress={e => {
              if(e.key === 'Enter') {
                e.preventDefault();
                const val = e.target.value.trim();
                if(val.length === 0) return;
                e.target.value = '';
                handleFilterSearch([{key: 'item_id', value: val, label: val}]);
              }
            }}/>
            <button onClick={handleClick}>
              <svg
                height={15}
                viewBox="-4 0 393 393.99"
                width={15}
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M368.313 0H17.05A16.5 16.5 0 0 0 2.344 8.96a16.732 16.732 0 0 0 1.3 17.415l128.688 181.281c.043.063.09.121.133.184a36.769 36.769 0 0 1 7.219 21.816v147.797a16.429 16.429 0 0 0 16.433 16.535c2.227 0 4.426-.445 6.48-1.297l72.313-27.574c6.48-1.976 10.781-8.09 10.781-15.453V229.656a36.774 36.774 0 0 1 7.215-21.816c.043-.063.09-.121.133-.184L381.723 26.367a16.717 16.717 0 0 0 1.3-17.406A16.502 16.502 0 0 0 368.313 0zM236.78 195.992a56.931 56.931 0 0 0-11.097 33.664v117.578l-66 25.164V229.656a56.909 56.909 0 0 0-11.102-33.664L23.648 20h338.07zm0 0" />
              </svg>
              <span>Filters</span>
              {filters.length > 0 && <div className="filter-counter">
                {filters.length}
              </div>}
            </button>
            <Menu
              id="simple-menu"
              anchorEl={anchorEl}
              keepMounted={false}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              // anchorOrigin={{ vertical: 'top', horizontal: 'right'}}
              // transformOrigin={{ vertical: 'top', horizontal: 'right'}}
              PopoverClasses={{paper: 'filter-paper' + (isDark ? ' dark' : '')}}
            >
              <CMSLogFilter handleFilterSearch={handleFilterSearch} init={filters} />
            </Menu>
          </div>
          <div className="cms-content-log-section-header" style={{paddingTop: 0}}>
            {
              filters.map(filter => (
                <div className="filter-view-item">
                  <span>{filter.label ?? filter.value}</span>
                  <svg
                    width={14}
                    height={14}
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    onClick={() => {
                      const newFilter = filters.filter(a => (a.key !== filter.key || a.value !== filter.value));
                      handleFilterSearch(newFilter);
                    }}
                  >
                    <path
                      d="M7 14c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7ZM7 .875A6.132 6.132 0 0 0 .875 7 6.132 6.132 0 0 0 7 13.125 6.132 6.132 0 0 0 13.125 7 6.132 6.132 0 0 0 7 .875Z"
                      fill="#000"
                    />
                    <path
                      d="M4.835 9.603a.438.438 0 0 1-.31-.747l4.332-4.332a.438.438 0 0 1 .619.62l-4.332 4.33a.438.438 0 0 1-.31.129Z"
                      fill="#000"
                    />
                    <path
                      d="M9.165 9.603a.434.434 0 0 1-.309-.129l-4.331-4.33a.437.437 0 1 1 .619-.62l4.331 4.332a.437.437 0 0 1-.31.747Z"
                      fill="#000"
                    />
                  </svg>
                </div>
              ))
            }
          </div>
          <table>
            <thead>
              <CMSLogRowHeaderItem disabled={true} sortData={sortData} setSortData={setSortData} colKey={'id'}>Log ID</CMSLogRowHeaderItem>
              <CMSLogRowHeaderItem disabled={true} sortData={sortData} setSortData={setSortData} colKey={'requested_by'}>Requested By</CMSLogRowHeaderItem>
              <CMSLogRowHeaderItem disabled={true} sortData={sortData} setSortData={setSortData} colKey={'timestamp'}>Date & Time</CMSLogRowHeaderItem>
              <CMSLogRowHeaderItem disabled={true} sortData={sortData} setSortData={setSortData} colKey={'item_id'}>Item ID</CMSLogRowHeaderItem>
              <CMSLogRowHeaderItem disabled={true} sortData={sortData} setSortData={setSortData} colKey={'action'}>Action</CMSLogRowHeaderItem>
              <CMSLogRowHeaderItem disabled={true} sortData={sortData} setSortData={setSortData} colKey={'status'}>Info</CMSLogRowHeaderItem>
              <CMSLogRowHeaderItem disabled={true} sortData={sortData} setSortData={setSortData} colKey={'level'}>Status</CMSLogRowHeaderItem>
            </thead>
            {!logs && (
              <tr>
                <td colSpan={7} style={{height: '70vh', alignItems: 'center', textAlign: 'center', padding: 0}}>
                  <PustackShimmer style={{width: '100%', height: '100%', borderRadius: 0}} />
                </td>
              </tr>
            )}
            {logs?.length === 0 && (
              <tr>
                <td colSpan={7} style={{height: '70vh', alignItems: 'center', textAlign: 'center', padding: 0}}>
                  <div style={{height: '100%', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    <p>No Logs</p>
                  </div>
                </td>
              </tr>
            )}
            {logs && logs.map((log) =>
              <CMSLogRowItem log={log} />
            )}
          </table>
        </div>
      </InfiniteScroll>
    </>
  )
}
