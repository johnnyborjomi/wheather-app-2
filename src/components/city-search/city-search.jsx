import * as React from "react";
import classnames from "classnames";

import { debounce } from "lodash";
import getCities from "./city-search.service.js";
import LoaderLinear from "../loader-linear/loader-linear.jsx";

import "./city-search.scss";

const defaultCities = []; // ["New York", "Tokyo", "Toronto", "Kharkiv"];

//todo: @vm: impl with autocomplete
export default class CitySearch extends React.Component {
  state = {
    suggestList: defaultCities,
    showSuggest: false,
    inputValue: "",
    isLoading: false
  };

  debouncedDataHandler = debounce(this.dataHandler, 500);

  dataHandler(value) {
    let query = value;
    this.setState({ isLoading: true });

    getCities(query).then(data =>
      this.setState({ suggestList: data, isLoading: false })
    );
  }

  onChange(value) {
    this.debouncedDataHandler(value);
    this.checkInputValue(value);
  }

  openSuggest(value) {
    this.setState({ showSuggest: true });
    this.checkInputValue(value);
  }

  closeSuggest(value) {
    setTimeout(() => {
      this.setState({ showSuggest: false });
      this.checkInputValue(value);
    }, 200);
  }

  checkInputValue(value) {
    this.setState({ inputValue: value });
  }

  renderSuggestions(suggest) {
    return suggest.map(city => (
      <li key={city.Key} onClick={() => this.props.onSearch(city)}>
        {city.LocalizedName}
      </li>
    ));
  }

  render() {
    const { suggestList = [], inputValue, isLoading, showSuggest } = this.state;

    const isNothingFound =
      suggestList.length === 0 && inputValue.length > 0 && !isLoading;

    const isEmptySearch = suggestList.length === 0 && inputValue.length === 0;

    return (
      <div className="city-search">
        <input
          type="text"
          placeholder="enter city name"
          className="city-search__input"
          onChange={event => this.onChange(event.target.value)}
          onFocus={event => {
            this.openSuggest(event.target.value);
          }}
          onKeyPress={event => {
            this.openSuggest(event.target.value);
          }}
          onClick={event => {
            this.openSuggest(event.target.value);
          }}
          onBlur={event => this.closeSuggest(event.target.value)}
        />
        <ul
          className={classnames([
            "city-search__suggestion",
            { "is-active": showSuggest, "is-loading": isLoading }
          ])}
        >
          {!isNothingFound && this.renderSuggestions(suggestList)}
          {isEmptySearch && this.renderSuggestions(defaultCities)}
          {isNothingFound && <li disabled>Nothing Found.</li>}
          <LoaderLinear isLoading={this.state.isLoading} />
        </ul>
        <div
          className={classnames(["overlay", { "is-active": showSuggest }])}
        />
      </div>
    );
  }
}
