import {ChevronRight} from "@material-ui/icons";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import useInstructors from "../../../../hooks/instructors";
import CloseIcon from "@material-ui/icons/Close";

const actions = [
  {id: 1, key: 'action', value: 'CREATE', label: 'Create'},
  {id: 2, key: 'action', value: 'DELETE', label: 'Delete'},
  {id: 3, key: 'action', value: 'UPDATE', label: 'Update'},
  {id: 4, key: 'action', value: 'REFRESH', label: 'Refresh'},
]

const levels = [
  {id: 1, key: 'level', value: 'success', label: 'Success'},
  {id: 2, key: 'level', value: 'error', label: 'Error'},
]


export default function CMSLogFilter({handleFilterSearch, init}) {
  const [filters, setFilters] = useState(init);
  const instructors = useInstructors(null);
  const [expand, setExpand] = useState({action: false, level: false, instructor: false});

  const affectedKeys = useMemo(() => {
    if(!filters) return [];
    return filters.filter(c => c.key === 'affected_keys_list');
  }, [filters])

  const getItems = useCallback((key, items) => {
    if(!items) return {
      height: 0,
      items: []
    }
    if(expand[key]) {
      return {
        height: 40 * items.length,
        items
      };
    }
    const activeFilters = filters.filter(c => c.key === key);
    const activeValues = activeFilters.map(c => c.value);
    let activeItems = items.filter(c => activeValues.includes(c.value) || activeValues.includes(c.label));
    // console.log('activeItems, activeFilters, activeValues - ', activeItems, activeFilters, activeValues, filters, key, items);
    return {
      height: 40 * activeItems.length,
      items: activeItems
    };
  }, [expand, filters])

  const toggleCheckbox = (key, value, checked, label) => {
    setFilters(c => {
      if(checked) {
        let filteredArr = c.filter(a => a.key === key);
        return [...filteredArr, {key, value, label}]
      }
      return c.filter(a => (a.key !== key || a.value !== value));
    });
  }

  const handleClearFilters = () => {
    setFilters([]);
  }

  const isChecked = useCallback((action) => {
    return Boolean(filters.find(c => (c.key === action.key && c.value === action.value)));
  }, [filters]);

  const toggleExpand = key => setExpand(c => ({...c, [key]: !c[key]}));

  return (
    <>
      <div className="filter-header">
        <h2>Filters</h2>
        <svg
          onClick={handleClearFilters}
          width={19}
          height={20}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7.661 3.333H1.323a.874.874 0 0 0-.716 1.375l5.08 6.914c.23.335.162-.024.162 7.46a.918.918 0 0 0 1.466.734c2.248-1.694 2.794-1.885 2.794-2.771 0-5.231-.068-5.09.162-5.423l1.088-1.482C8.62 9.146 6.98 6.25 7.66 3.333Z"
            fill="#ea0304"
          />
          <path
            d="M10.255 1.178c-2.933 2.63-1.511 7.319 2.186 8.05 2.948.622 5.594-1.714 5.594-4.569 0-4.008-4.78-6.139-7.78-3.48Zm4.63 4.172a.588.588 0 0 1-.414 1.003c-.313 0-.392-.148-1.112-.865-.706.702-.792.865-1.112.865a.588.588 0 0 1-.414-1.003l.694-.691-.694-.691c-.551-.549.279-1.38.829-.832l.697.694.697-.694c.55-.548 1.38.283.83.832l-.695.691.694.691Z"
            fill="#ea0304"
          />
        </svg>
      </div>
      <div className="filter-item">
        <input onKeyPress={e =>  {
          if(e.key === 'Enter') {
            e.preventDefault();
            const val = e.target.value.trim();
            if(val.length === 0) return;
            setFilters(c => {
              const isThere = c.find(a => a.key === 'affected_keys_list' && a.value === val);
              if(isThere) return c;
              const newC = c.filter(a => a.key === 'affected_keys_list');
              return [...newC, {key: 'affected_keys_list', value: val, label: val}];
            });
            e.target.value = '';
          }
        }} type="text" placeholder="Add affected keys..."/>
        <div className="affected-key-item-container">
          {affectedKeys.map(affectedKey => (
            <div className="affected-key-item" key={affectedKey.label}>
              <span>{affectedKey.label}</span>
              <CloseIcon onClick={() => {
                setFilters(c => {
                  return c.filter(a => a.value !== affectedKey.value || a.key !== affectedKey.key);
                })
              }} />
            </div>
          ))}
        </div>
        {/*<ul className="filter-item-value-container" style={{height: getItems('action', actions).height + 'px', overflow: 'hidden'}}>*/}
        {/*  {getItems('action', actions).items?.map(action => (*/}
        {/*    <li className="filter-item-value">*/}
        {/*      <FormControlLabel*/}
        {/*        control={*/}
        {/*          <Checkbox*/}
        {/*            checked={isChecked(action)}*/}
        {/*            onChange={(c) => {*/}
        {/*              toggleCheckbox(action.key, action.value, c.currentTarget.checked, action.label);*/}
        {/*            }}*/}
        {/*            name="checkedB"*/}
        {/*            color="primary"*/}
        {/*          />*/}
        {/*        }*/}
        {/*        label={action.label}*/}
        {/*      />*/}
        {/*    </li>*/}
        {/*  ))}*/}
        {/*</ul>*/}
      </div>
      <div className="filter-item">
        <div className={"filter-item-anchor" + (expand['action'] ? ' open' : '')} onClick={() => toggleExpand('action')}>
          {/*<KeyboardArrowDown />*/}
          <ChevronRight />
          <p>Action</p>
        </div>
        <ul className="filter-item-value-container" style={{height: getItems('action', actions).height + 'px', overflow: 'hidden'}}>
          {getItems('action', actions).items?.map(action => (
            <li className="filter-item-value">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isChecked(action)}
                    onChange={(c) => {
                      toggleCheckbox(action.key, action.value, c.currentTarget.checked, action.label);
                    }}
                    name="checkedB"
                    color="primary"
                  />
                }
                label={action.label}
              />
            </li>
          ))}
        </ul>
      </div>
      <div className="filter-item">
        <div className={"filter-item-anchor" + (expand['level'] ? ' open' : '')} onClick={() => toggleExpand('level')}>
          {/*<KeyboardArrowDown />*/}
          <ChevronRight />
          <p>Status</p>
        </div>
        <ul className="filter-item-value-container" style={{height: getItems('level', levels).height + 'px', overflow: 'hidden'}}>
          {getItems('level', levels).items?.map(action => (
            <li className="filter-item-value">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isChecked(action)}
                    onChange={(c) => {
                      toggleCheckbox(action.key, action.value, c.currentTarget.checked, action.label);
                    }}
                    name="checkedB"
                    color="primary"
                  />
                }
                label={action.label}
              />
            </li>
          ))}
        </ul>
      </div>
      <div className="filter-item">
        <div className={"filter-item-anchor" + (expand['requested_by_id'] ? ' open' : '')} onClick={() => toggleExpand('requested_by_id')}>
          {/*<KeyboardArrowDown />*/}
          <ChevronRight />
          <p>Instructors</p>
        </div>
        <ul className="filter-item-value-container" style={{height: getItems('requested_by_id', instructors).height + 'px', overflow: 'hidden'}}>
          {getItems('requested_by_id', instructors).items?.map((instructor) => <li className="filter-item-value">
            <FormControlLabel
              control={
                <Checkbox
                  checked={isChecked({key: 'requested_by_id', value: instructor.value})}
                  onChange={(c) => {
                    toggleCheckbox('requested_by_id', instructor.value, c.currentTarget.checked, instructor.label)
                  }}
                  name="checkedB"
                  color="primary"
                />
              }
              label={instructor.label}
            />
          </li>)}
        </ul>
      </div>
      <div className="filter-buttons">
        <button onClick={() => {
          handleClearFilters();
          handleFilterSearch([]);
        }} className="clear">Clear</button>
        <button onClick={e => handleFilterSearch(filters)}>Search</button>
      </div>
    </>
  )
}
