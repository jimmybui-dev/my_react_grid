import React, { Component } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-blue.css';
import Popup from './popup';
import Loading from './loading';
import Error from './error';
import moment from 'moment';
import axios from 'axios';

class Jobs extends Component {
  // Initialization
  constructor(props) {
    super(props);
    this.state = {
        openPopup: false,
        error: null,
        loading: true,
        detail: {},
        columnDefs: [
                { headerName: "Title", field: "title", width: 500 },
                { headerName: "Location", field: "location", width: 200 },
                { headerName: "Date", field: "date", cellClass: "grid-number", width: 150,
                    cellRenderer: (data) => {
                      return moment(data.value).format("DD/MM/YYYY");
                  }
                }
            ],
        rowData: []
    };
    this.handlePopup = this.handlePopup.bind(this);
  }

  // Handle showing and hiding the popup
  handlePopup(row) {
    // Get the detail job
    this.setState({
      openPopup: !this.state.openPopup,
      detail: row && row.data ? row.data : {}
    });
  }
    
  componentDidMount() {
    // Assume the request will be a haft of second
    setTimeout(()=>{
      // Get the list of jobs
      axios.get('http://localhost:4000/jobs')
      .then(resp => {
        const jobs = resp.data.sort((a, b) => a.title.localeCompare(b.title));
        this.setState({
          loading: false,
          rowData: jobs
        })
      }).catch((err) => 
        this.setState({
          loading: false,
          error: err
        })
      );
    }, 500);
  }
    
  onGridReady = params => {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.gridApi.sizeColumnsToFit();
    this.gridColumnApi.autoSizeColumns();
  }

  render() {
    const { openPopup, error, loading, detail, columnDefs, rowData } = this.state;
    if (error) {
      return (<Error message={ error.message } />);
    } else if (loading) {
      return (<Loading />);
    } else {
        return (
            <div id="container" className="ag-theme-blue">
                <h3>Job Board</h3><br/>
                <AgGridReact
                    onGridReady={this.onGridReady}
                    columnDefs = {columnDefs}
                    rowData = {rowData}
                    enableSorting = {true}
                    enableFilter = {true}
                    paginationAutoPageSize = {true}
                    pagination = {true}
                    rowSelection = {'single'}
                    enableColResize = {true}
                    onRowDoubleClicked = {this.handlePopup}>
                </AgGridReact>
                {
                    openPopup ? 
                    <Popup  
                          title='Job Detail'
                          openPopup={openPopup}
                          detail={detail}
                          handlePopup={this.handlePopup}
                    />  
                    : null
                }
            </div>
        );
    }
  }
}

export default Jobs;