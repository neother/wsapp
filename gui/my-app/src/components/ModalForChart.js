import React, { Component ,useState} from 'react';
// import the core library.
import ReactEcharts from 'echarts-for-react'
import { Button, Modal } from 'react-bootstrap'
// then import echarts modules those you have used manually.
import echarts from 'echarts/lib/echarts';
import Clock from './Clock';
import { candlestick } from 'echarts/lib/theme/dark';
import Chart from './Chart';
import { initProps } from 'echarts/lib/util/graphic';
// import 'echarts/lib/component/candlesticks'


export default function ModalForChart(props) {
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (
        <>
            <Button variant="primary" onDoubleClick={handleShow}>
                Launch demo modal
            </Button>

            <Modal show={show} onHide={handleClose}>
                {/* <Modal.Header closeButton>
                    <Modal.Title>Modal heading</Modal.Title>
                </Modal.Header> */}
                <Modal.Body>
                    <Chart chartName= {props.name} chartScale={props.scale}></Chart>
                </Modal.Body>
                {/* <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                </Button>
                    <Button variant="primary" onClick={handleClose}>
                        Save Changes
                </Button>
                </Modal.Footer> */}
            </Modal>
            
        </>
    );
}


