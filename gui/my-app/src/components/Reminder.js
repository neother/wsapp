import React, { Component } from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap'
import Chart from './Chart';
import names from '../properties/names';
import getPrimaryName from '../util/getPrimaryName';
import StoredRecords from "./StoredRecords";
const primary_names = names
export default class Review extends Component {

    constructor() {
        super()
        this.state = {
            chartName: "",
            chartScale: '5',
            nameHandler: '',
            scaleHandler: '',
            records: []
        }
        this.name = ''
        this.scale = ''

    }

    getRecords = () => {
        const url = 'http://localhost:5001/db?name='+this.state.chartName+"&scale="+this.state.chartScale
        fetch(url, {
            method: 'get',
            headers: {
                'Accept': 'application/json,text/plain,*/*',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
        }).then((response) => {

            return response.json()
        }
        ).then(data => {
            // console.log(data)
            this.setState({ records: data })
        })
    }


    componentDidMount() {
        this.getRecords()
        this.interval = setInterval(() => {
            this.getRecords()
        }, 5000);
    }

    componentWillUnmount() {
        console.log('i am ummounting')
        clearInterval(this.interval);
        }
    


    handleNameChange = (e) => {
        this.setState({ nameHandler: e.target.value });
    }
    handleScaleChange = (e) => {
        this.setState({ scaleHandler: e.target.value });
    }
    handleSearch = () => {
        let newName = getPrimaryName(this.state.nameHandler, primary_names)
        this.setState({
            chartName: newName,
            chartScale: this.state.scaleHandler
        });
        console.log('handle input:' + this.state.chartName + ' ' + this.state.chartScale)
        // this.getRecords()
    }

    render() {
        return (
            <div>
                <Form >
                    <Form.Row className='form-row'>
                        <Col>
                            <Form.Control size='sm' name='name' value={this.state.nameHandler} onChange={this.handleNameChange} />
                        </Col>
                        <Col>
                            <Form.Control size='sm' name='Scale' value={this.state.scaleHandler} onChange={this.handleScaleChange} />
                        </Col>
                        <Col>
                            <Button size='sm' variant="outline-dark" type="button" onClick={this.handleSearch}>Search</Button>
                        </Col>
                    </Form.Row>
                </Form>
                <Chart id='chart'
                    hasHandel='true'
                    chartName={this.state.chartName}
                    chartScale={this.state.chartScale}
                    chartHeight='500'
                    kLineWidth='400'
                    start= '10' />

                <Monitor records={this.state.records} ></Monitor>
                
                
            </div>
        );
    }
}



