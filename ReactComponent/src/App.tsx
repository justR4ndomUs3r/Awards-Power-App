/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/consistent-indexed-object-style */
/* eslint-disable promise/always-return */
/* eslint-disable promise/no-nesting */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable no-useless-escape */
/* eslint-disable react/no-unknown-property */


import * as React from 'react';
import {Modal, Card, Button, Tag, Carousel, Table, Tabs, Message, InputGroup, InputNumber, Accordion, TagGroup, Loader, Grid, Row, Col, IconButton} from 'rsuite';
import 'rsuite/dist/rsuite.min.css';
import HelpOutlineIcon from '@rsuite/icons/HelpOutline';
import awardsJSONfile from './awards.json';


export interface IAppProps {
    username?: string;
    userId: string;
    adminId?: string;
    updateTriggerFlow: (value: string) => void;
    requestData: ComponentFramework.PropertyTypes.DataSet;
    awards : string
}

export interface IAppState {
    myState: number;
    modalOpen: boolean;
    modalHelpOpen: boolean;
}

interface IItems {
    key: string;
    ID: string;
    Title: string;
    From: string;
    FromID: string;
    To: string;
    ToID: string;
    Description: string;
    Status: string;
    Date: string;
    Points: number;
    IsAward: string;
}

interface IAwards {
    name: string;
    description: string;
    points: number;
    attachment: string;
}

export class App extends React.Component<IAppProps, IAppState> {
    private notificationValues: { [key: string]: number } = {};

    constructor(props: IAppProps) {
        super(props);
        this.state = { myState: 0, modalOpen: true, modalHelpOpen: false };

        try {
            this.props.requestData.paging.setPageSize(30000000)
            while (this.props.requestData.sorting.length > 0) {
                this.props.requestData.sorting.pop();
            }
            this.props.requestData.sorting.push({
                name: 'Date',
                sortDirection: 1,
            });
            this.props.requestData.paging.loadExactPage(1)
            /*
            this.props.requestData?.filtering.setFilter({
                filterOperator: 0,  //and
                conditions:[
                    {
                        attributeName: "From",
                        conditionOperator: 0, //eq
                        value: "Tester"
                    }
                ]
            });
            
             */
            this.props.requestData.refresh();
            
        }catch (e){
            console.error(e);
        }
    }

    handleClose(){
        this.setState({modalOpen: false})
    }

    helpClose(){
        this.setState({modalHelpOpen: false})
    }

    helpOpen(){
        this.setState({modalHelpOpen: true})
    }

    handleNotificationChange = (id: string, value: number | null | string) => {
        if (value !== null) {
            if(typeof(value) === "string")
            {
                value = parseInt(value)
            }
            this.notificationValues[id] = value;
        }
    };

    handleNotificationClick = (id: string, status: string) => {
        const dataset = this.props.requestData;
        const record = dataset.records[id];

        if (!record) {
            console.error(`Record ${id} not found.`);
            return;
        }

        try {
            (record as any).setValue("Status", status);
            if(this.notificationValues[id])
                (record as any).setValue("Points", this.notificationValues[id]);

            (record as any).save().then(() => {
                dataset.refresh();
            }).catch((error: any) => {
                console.error("Save Error:", error);
            });
        } catch (error) {
            console.error("Error updating record:", error);
        }
    };

    getAward = (award: any) => {
        const dataset = this.props.requestData;

        (dataset as any).newRecord().then((rec: any) => {
            rec.setValue("Status", "Pending")
            rec.setValue("Title", award.name)
            rec.setValue("From", "Digiten")
            rec.setValue("FromID", "DX")
            rec.setValue("To", this.props.username)
            rec.setValue("ToID", this.props.userId)
            rec.setValue("Description", award.description)
            rec.setValue("Points", award.points)
            rec.setValue("IsAward", true)
            
            rec.save().then(() => {
                dataset.refresh();
            }).catch((error: any) => {
                console.error("Save Error:", error);
            });
        }).catch(console.error);
    };
    
    getAwardsList = (dataset : ComponentFramework.PropertyTypes.DataSet) : IAwards[] => {
        return dataset.sortedRecordIds.map(id => {
            const entityId = dataset.records[id]
            const attributes = dataset.columns.map(column => {
                return {[column.name]: entityId.getFormattedValue(column.name)};
            })
            return Object.assign({
                key: entityId.getRecordId(),
            }, ...attributes);
        })
    }

    getDatasetItems = (dataset: ComponentFramework.PropertyTypes.DataSet, filter = ""): [
        { name: string; displayName: string }[],  // Columns Array
        IItems[]  // Records Array
    ] => {
        const columns = dataset.columns.map(column => ({
            name: column.name,
            displayName: column.displayName
        }));

        const records = dataset.sortedRecordIds.map(id => {
            const entityId = dataset.records[id]
            const attributes = dataset.columns.map(column => {
                return {[column.name]: entityId.getFormattedValue(column.name)};
            })
            return Object.assign({
                key: entityId.getRecordId(),
            }, ...attributes);
        }).filter(row => {
            switch (filter) {
                case "from":
                    return row.FromID === this.props.userId;
                case "to":
                    return ((row.IsAward === "False" || row.IsAward === null ) && row.ToID === this.props.userId);
                case "awards":
                    return (row.IsAward === "True" && row.ToID === this.props.userId);
                case "pending":
                    return row.Status === "Pending";
                default:
                    return true;
            }
        });

        return [columns, records]; // Explicitly return both arrays
    };

    renderTable(items:IItems[], title: string, index: number ) {
        return (
            <Tabs.Tab eventKey={`${index}`} title={title}>
                <Accordion defaultActiveKey={-1} >
                    {items.map((item, i) =>{
                        if(title !== "Pending")
                        return (
                        <Accordion.Panel key={item.key} header={(
                            <div className={"DXtab__row"}>
                                <div style={{display: "flex"}}>
                                    {item.IsAward === "False" &&
                                    <p>{item.Title} to {item.To} from {item.From}</p>
                                    }
                                    {item.IsAward === "True" &&
                                        <>
                                            <p>{item.Title} for {item.To}</p>
                                            <svg style={{fill: "yellow"}} width="20px" height="20px"
                                                 viewBox="0 0 120 120" id="Layer_1" version="1.1">
                                                <g>
                                                    <polygon
                                                        points="75.7,58.3 60,66.2 44.3,58.3 24.9,97.1 37,95.9 43.2,106.3 60,72.9 76.8,106.3 83,95.9 95.1,97.1  "/>
                                                    <path
                                                        d="M92.8,38.2l-1.1,4.2c-0.3,1.4-0.1,2.9,0.6,4.2l2.1,3.8c1.3,2.2,0.9,5.1-1.1,6.9l-3.2,2.9   c-1.1,1-1.7,2.4-1.8,3.8l-0.2,4.3c-0.2,2.6-2,4.8-4.6,5.2l-4.3,0.8c-1.4,0.3-2.7,1.1-3.6,2.2L73.1,80c-1.5,2.1-4.3,2.9-6.6,1.9   l-4-1.7c-1.4-0.6-2.8-0.6-4.2,0l-4.1,1.6c-2.4,0.9-5.2,0.1-6.7-2L45,76.1c-0.8-1.2-2.1-2-3.5-2.3L37.3,73c-2.6-0.5-4.4-2.7-4.5-5.3   l-0.2-4.4c0-1.5-0.6-2.8-1.7-3.8l-3.2-3c-1.9-1.8-2.3-4.6-0.9-6.9l2.3-3.8c0.8-1.2,1-2.7,0.6-4.1l-1-4.3c-0.6-2.5,0.6-5.1,2.9-6.3   l3.9-1.9c1.3-0.6,2.3-1.8,2.8-3.1l1.4-4.2c0.9-2.4,3.3-4,5.9-3.7l4.4,0.4c1.4,0.2,2.9-0.2,4.1-1.2l3.4-2.7c2-1.6,4.9-1.6,6.9,0.1   l3.4,2.7c1.2,0.9,2.6,1.4,4,1.2l4.3-0.4c2.6-0.3,5,1.3,5.8,3.8l1.3,4.1c0.4,1.4,1.5,2.6,2.8,3.2l3.9,2   C92.2,33.1,93.5,35.7,92.8,38.2z"/>
                                                    <circle cx="60" cy="48.6" r="25.4"/>
                                                </g>
                                            </svg>
                                        </>
                                    }
                                </div>
                                <TagGroup>
                                    <span className={"date"}>{item.Date}</span>
                                    <Tag className={item.Status === "Accepted"? "status accept" : item.Status === "Canceled" ? "status cancel" : "status" }>{item.Status === "Accepted" && item.IsAward === "True"? "Given" : item.Status}</Tag>
                                    <Tag className={"listCoin"}>{item.Points}dc</Tag>
                                </TagGroup>
                            </div>)} eventKey={i}>
                                <p>{item.Description}</p>
                            </Accordion.Panel>
                    )
                        else
                            if (item.Status === "Pending") {
                                const usedThisMonth = this.calcGivenThisMonth(items, item.FromID)
                                return (
                                    <Accordion.Panel key={item.key} header={(<div className={"DXtab__row"}>
                                        <div style={{display: "flex", alignItems: "center"}}>
                                            {item.IsAward === "False" &&
                                                <p>{item.Title} to {item.To} from {item.From}
                                                    <strong
                                                        style={usedThisMonth > 75 ? {color: "#E3134B"} : usedThisMonth < 50 ? {color: "#22F5AC"} : {}}> ({usedThisMonth.toLocaleString()}dc/mth)</strong>
                                                </p>
                                            }
                                            {item.IsAward === "True" &&
                                                <>
                                                    <p>{item.Title} for {item.To}</p>
                                                    <svg style={{fill: "yellow"}} width="20px" height="20px" viewBox="0 0 120 120" id="Layer_1" version="1.1">
                                                        <g>
                                                            <polygon points="75.7,58.3 60,66.2 44.3,58.3 24.9,97.1 37,95.9 43.2,106.3 60,72.9 76.8,106.3 83,95.9 95.1,97.1  "/>
                                                            <path  d="M92.8,38.2l-1.1,4.2c-0.3,1.4-0.1,2.9,0.6,4.2l2.1,3.8c1.3,2.2,0.9,5.1-1.1,6.9l-3.2,2.9   c-1.1,1-1.7,2.4-1.8,3.8l-0.2,4.3c-0.2,2.6-2,4.8-4.6,5.2l-4.3,0.8c-1.4,0.3-2.7,1.1-3.6,2.2L73.1,80c-1.5,2.1-4.3,2.9-6.6,1.9   l-4-1.7c-1.4-0.6-2.8-0.6-4.2,0l-4.1,1.6c-2.4,0.9-5.2,0.1-6.7-2L45,76.1c-0.8-1.2-2.1-2-3.5-2.3L37.3,73c-2.6-0.5-4.4-2.7-4.5-5.3   l-0.2-4.4c0-1.5-0.6-2.8-1.7-3.8l-3.2-3c-1.9-1.8-2.3-4.6-0.9-6.9l2.3-3.8c0.8-1.2,1-2.7,0.6-4.1l-1-4.3c-0.6-2.5,0.6-5.1,2.9-6.3   l3.9-1.9c1.3-0.6,2.3-1.8,2.8-3.1l1.4-4.2c0.9-2.4,3.3-4,5.9-3.7l4.4,0.4c1.4,0.2,2.9-0.2,4.1-1.2l3.4-2.7c2-1.6,4.9-1.6,6.9,0.1   l3.4,2.7c1.2,0.9,2.6,1.4,4,1.2l4.3-0.4c2.6-0.3,5,1.3,5.8,3.8l1.3,4.1c0.4,1.4,1.5,2.6,2.8,3.2l3.9,2   C92.2,33.1,93.5,35.7,92.8,38.2z"/>
                                                            <circle  cx="60" cy="48.6" r="25.4"/>
                                                        </g>
                                                    </svg>
                                                </>
                                            }
                                        </div>
                                        <span className={"date"}>{item.Date}</span>
                                    </div>)}
                                                     eventKey={i}>
                                        <p>{item.Description}</p>
                                        <InputGroup>
                                            {item.IsAward !== "True" && <InputNumber
                                                className="custom-input-number"
                                                defaultValue={0}
                                                onChange={(value: number | string | null) => this.handleNotificationChange(item.key, value)}
                                            />}
                                            <Button
                                                size="sm"
                                                color="green"
                                                appearance="primary"
                                                onClick={() => this.handleNotificationClick(item.key, "Accepted")}
                                            >
                                                {item.IsAward != "True"? "Accept" : "Mark as Given"}
                                            </Button>
                                            <Button
                                                size="sm"
                                                color="red"
                                                appearance="primary"
                                                onClick={() => this.handleNotificationClick(item.key, "Canceled")}
                                            >
                                                Cancel
                                            </Button>

                                        </InputGroup>
                                    </Accordion.Panel>
                                )
                            }
                        }
                    )}
                </Accordion>
            </Tabs.Tab>
        );
    }

    calcPoints(items:any[], filter: string[]){
        let points = 0;
        items.forEach((item, i) => {
            if(filter.includes(item.Status)) {
                points += parseInt((item.Points).replace(",", ""));
            }
        })
        
        return points;
    }
    
    calcGivenThisMonth(items:any[], userID:string){
        let points = 0;
        const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        for(const item of items){
            if(Date.parse(firstDayOfMonth.toDateString()) > Date.parse(item.Date))
                return points
            if(item.FromID === userID && item.Status === "Accepted")
                points += parseInt((item.Points).replace(",", ""));
        }
        return points
    }

    render() {
        let awardsJSON = [];
        try {
            if(this.props.awards === "")
                awardsJSON = awardsJSONfile;
            else
                awardsJSON = JSON.parse(JSON.parse(this.props.awards));
        }catch(error){
            console.error("Error JSON:", error);
        }
        
        
        const [fromColumns, fromItems] = this.getDatasetItems(this.props.requestData, "from");
        const [toColumns, toItems] = this.getDatasetItems(this.props.requestData, "to");
        const [awardsColumns, awardsItems] = this.getDatasetItems(this.props.requestData, "awards");
        const [pendingColumns, pendingItems] = this.getDatasetItems(this.props.requestData, "pending");
        const [allColumns, allItems] = this.getDatasetItems(this.props.requestData);
        const userPoints = (this.calcPoints(toItems, ["Accepted"]) - this.calcPoints(awardsItems, ["Accepted", "Pending"]));


        return (
            <div className="component__wrapper">
                <Modal className={"digi_modal"} open={(this.props.adminId?.includes(this.props.userId) && pendingItems.length > 0 && this.state.modalOpen)} onClose={() => this.handleClose()}>
                    <Modal.Header>
                        <Modal.Title>Pending requests!</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Please check Pending tab to review all Pending requests.
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={() => this.handleClose()} appearance="primary">
                            Ok
                        </Button>
                    </Modal.Footer>
                </Modal>

                <Modal className={"digi_modal"} open={(this.state.modalHelpOpen)} onClose={() => this.helpClose()}>
                    <Modal.Header>
                        <Modal.Title>DigiCoins example list</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <table>
                            <tr>
                                <th>DigiCoins</th>
                                <th>For what?</th>
                            </tr>
                            <tr>
                                <td>10dc</td>
                                <td>Zaangażowanie w budowanie dobrej atmosfery w zespole</td>
                            </tr>
                            <tr>
                                <td>10dc</td>
                                <td>Zaangażowanie w budowanie dobrej atmosfery w zespole</td>
                            </tr>
                            <tr>
                                <td>10dc</td>
                                <td>Zaangażowanie w budowanie dobrej atmosfery w zespole</td>
                            </tr>
                            <tr>
                                <td>10dc</td>
                                <td>Zaangażowanie w budowanie dobrej atmosfery w zespole</td>
                            </tr>
                            <tr>
                                <td>10dc</td>
                                <td>
                                    Zorganizowanie integracji zespołu
                                </td>
                            </tr>
                            <tr>
                                <td>10dc</td>
                                <td>
                                    Podzielenie się pomysłem, który usprawnił pracę zespołu
                                </td>
                            </tr>
                            <tr>
                                <td>10dc</td>
                                <td>
                                    Świetna komunikacja i proaktywność w projekcie
                                </td>
                            </tr>
                            <tr>
                                <td>10dc</td>
                                <td>
                                    Pomoc w przygotowaniu dokumentacji/procesów
                                </td>
                            </tr>
                            <tr>
                                <td>10dc</td>
                                <td>Wsparcie przy trudnym problemie technicznym</td>
                            </tr>
                            <tr>
                                <td>10dc</td>
                                <td>Przygotowanie świetnej prezentacji dla zespołu</td>
                            </tr>
                            <tr>
                                <td>10dc</td>
                                <td>Pomoc w onboardingu nowego pracownika</td>
                            </tr>
                            <tr>
                                <td>10dc</td>
                                <td>Zostanie po godzinach i pomoc w finalizacji projektu</td>
                            </tr>
                            <tr>
                                <td>10dc</td>
                                <td>Ratunek w kryzysowej sytuacji (np. szybka poprawka na produkcji)</td>
                            </tr>
                        </table>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={() => this.helpClose()} appearance="primary">
                        Ok
                        </Button>
                    </Modal.Footer>
                </Modal>
                <div className="DXnavigation">
                    <div className="DXnavigation__logo">
                        <p>Gratitude App</p>
                    </div>
                    <div className="DXnavigation__user">
                        <IconButton
                            className={"helpIcon"}
                            onClick={() => {this.helpOpen()}}
                            icon={<HelpOutlineIcon />}
                        />
                        <span className={"text"}>Oh Hi {this.props.username}</span>
                        <Tag className={"coinTag"} size={"lg"}>{userPoints.toLocaleString()}dc</Tag>
                    </div>
                </div>
                <div className="DXcontent">
                    {/*this.props.adminId?.includes(this.props.userId) && pendingItems.length > 0 && (
                        <div className="DXcontent__flow DXcontent__admin blue">
                            {pendingItems.map(item => (
                                <Message key={item.key} type={item.IsAward === "True"? "warning" : "info"}>
                                    <div className="DXcontent__body">
                                        <div className={"DXcontent__body__text"}>
                                            <h5>{item.Title + " for " + item.To}</h5>
                                            {item.IsAward !== "True" && 
                                                <strong>From {item.From} {this.calcGivenThisMonth(allItems, item.FromID).toLocaleString()} dc used this month</strong>
                                            }
                                            <p>{item.Description}</p>
                                        </div>
                                        <InputGroup>
                                            {item.IsAward !== "True" && <InputNumber
                                                className="custom-input-number"
                                                defaultValue={0}
                                                onChange={(value: number) => this.handleNotificationChange(item.key, value)}
                                            />}
                                            <Button
                                                size="sm"
                                                color="green"
                                                appearance="primary"
                                                onClick={() => this.handleNotificationClick(item.key, "Accepted")}
                                            >
                                                {item.IsAward !== "True"? "Accept" : "Mark as Given"}
                                            </Button>
                                            <Button
                                                size="sm"
                                                color="red"
                                                appearance="primary"
                                                onClick={() => this.handleNotificationClick(item.key, "Canceled")}
                                            >
                                                Cancel
                                            </Button>
                                        </InputGroup>
                                    </div>
                                </Message>
                            ))}
                        </div>
                    )*/}
                    <div className="DXcontent__flow DXcontent__userflow blue ">
                        {awardsJSON.length > 0 &&
                            <>
                                <Grid fluid>
                                    <Row className="show-grid">
                                        {awardsJSON.map((award: IAwards, index: number) => (
                                            <Col xs={6} key={index}
                                                 className={"content__card" + (award.points > userPoints ? " disabled" : "")}>
                                                <Card shaded>
                                                    <img
                                                        //src="https://www.shutterstock.com/image-vector/gold-podium-star-vector-illustration-600nw-2473961929.jpg"
                                                        src={award.attachment !== "false" ? `data:image/jpeg;base64,${award.attachment}` : "https://www.shutterstock.com/image-vector/gold-podium-star-vector-illustration-600nw-2473961929.jpg"}
                                                        alt="Award"
                                                    />
                                                    <Tag className={"cardCoin"} size="lg"
                                                         style={{marginLeft: "auto"}}>{award.points}dc</Tag>
                                                    <Card.Header as="h5"
                                                                 style={{textAlign: "left"}}>{award.name}</Card.Header>
                                                    <Card.Body
                                                        style={{textAlign: "left"}}>{award.description}</Card.Body>
                                                    <Card.Footer>
                                                        {award.points <= userPoints &&
                                                            <Button className={"getButton"} size="sm" color="green" appearance="primary"
                                                                    onClick={() => this.getAward(award)}>
                                                                I want it
                                                            </Button>
                                                        }
                                                    </Card.Footer>
                                                </Card>
                                            </Col>
                                        ))}
                                    </Row>
                                </Grid>
                            </>
                        }
                        {!(awardsJSON.length > 0) && <Loader style={{
                            height: 400,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }} size="lg"/>}
                    </div>
                    <div className="DXcontent__flow black DXcontent__history">
                        <svg className={"absoluteImage"} style={{height: 100, zIndex: "1", top: "-60px", right: "15px"}}
                             width="170" height="101" viewBox="0 0 170 101" fill="none"
                             xmlns="http://www.w3.org/2000/svg">
                            <g clip-path="url(#clip0_27_770)">
                                <path
                                    d="M169.614 18.4874C159.051 6.32348 145.771 0 129.993 0C100.497 0 79.5912 20.727 79.5912 50.5C79.5912 80.273 100.497 101 129.993 101C145.727 101 159.007 94.6765 169.614 82.293L137.795 50.4122L169.614 18.5313V18.4874Z"
                                    fill="#7572FA"/>
                                <path
                                    d="M40.2339 0H0.613525V101H40.2339C68.0645 101 90.6358 78.3848 90.6358 50.5C90.6358 22.6152 68.0645 0 40.2339 0Z"
                                    fill="#0300A5"/>
                                <path
                                    d="M66.7935 42.5956C66.2676 38.4678 63.3311 35.5695 60.1317 35.9647C56.9322 36.36 54.7847 39.9169 55.2668 44.0008C55.7489 48.0847 58.7292 51.0269 61.9286 50.6317C65.128 50.2365 67.2756 46.6795 66.7935 42.5956Z"
                                    fill="white"/>
                                <path
                                    d="M86.4284 31.0904C83.1851 31.4856 81.0814 35.0426 81.5635 39.1265C82.0456 43.2104 85.0259 46.1526 88.2253 45.7573C91.4247 45.3621 93.5723 41.8052 93.0902 37.7213C92.6081 33.6373 89.6278 30.6952 86.4284 31.0904Z"
                                    fill="white"/>
                                <path
                                    d="M89.8469 53.6618C88.7951 53.6179 87.9185 54.4083 87.8747 55.4622C87.6994 59.5022 85.4203 62.7518 81.7826 64.1131C76.3041 66.177 70.8257 63.2787 67.5386 59.8535C66.8373 59.107 65.6102 59.107 64.8651 59.8535C64.12 60.5561 64.12 61.7857 64.8651 62.5322C69.467 67.2748 75.3399 69.3826 80.7746 68.3726C81.5635 68.197 82.3524 67.9774 83.1413 67.714C88.1376 65.8257 91.4247 61.2148 91.6439 55.6818C91.6877 54.6279 90.8988 53.7496 89.8469 53.7057V53.6618Z"
                                    fill="white"/>
                                <path
                                    d="M127.013 20.9904C128.03 20.9904 128.854 20.0074 128.854 18.7948C128.854 17.5821 128.03 16.5991 127.013 16.5991C125.996 16.5991 125.172 17.5821 125.172 18.7948C125.172 20.0074 125.996 20.9904 127.013 20.9904Z"
                                    fill="white"/>
                                <path
                                    d="M127.013 22.0883C125.391 22.0883 124.076 20.5953 124.076 18.7948C124.076 16.9944 125.391 15.5013 127.013 15.5013C128.635 15.5013 129.949 16.9944 129.949 18.7948C129.949 20.5953 128.635 22.0883 127.013 22.0883ZM127.013 17.7409C126.618 17.7409 126.268 18.2679 126.268 18.8387C126.268 19.4096 126.618 19.9366 127.013 19.9366C127.364 19.9366 127.758 19.4974 127.758 18.8387C127.758 18.18 127.364 17.7409 127.013 17.7409Z"
                                    fill="white"/>
                                <path
                                    d="M127.013 22.4834C125.172 22.4834 123.726 20.8586 123.726 18.8386C123.726 16.8186 125.216 15.1938 127.013 15.1938C128.81 15.1938 130.3 16.8186 130.3 18.8386C130.3 20.8586 128.81 22.4834 127.013 22.4834ZM127.013 18.0921C127.013 18.0921 126.618 18.3556 126.618 18.7947C126.618 19.2338 126.881 19.4973 127.013 19.4973C127.144 19.4973 127.407 19.2338 127.407 18.7947C127.407 18.3556 127.144 18.0921 127.013 18.0921Z"
                                    fill="white"/>
                                <path
                                    d="M127.013 23.5813C124.602 23.5813 122.63 21.4295 122.63 18.8387C122.63 16.2478 124.602 14.0961 127.013 14.0961C129.423 14.0961 131.396 16.2478 131.396 18.8387C131.396 21.4295 129.423 23.5813 127.013 23.5813ZM127.013 16.2478C125.786 16.2478 124.822 17.3895 124.822 18.7948C124.822 20.2 125.83 21.3417 127.013 21.3417C128.196 21.3417 129.204 20.2 129.204 18.7948C129.204 17.3895 128.196 16.2478 127.013 16.2478ZM127.013 20.6391C126.18 20.6391 125.523 19.8048 125.523 18.7948C125.523 17.7848 126.18 16.9943 127.013 16.9943C127.846 16.9943 128.503 17.8287 128.503 18.7948C128.503 19.7609 127.846 20.6391 127.013 20.6391ZM127.013 18.4435C126.575 18.4435 126.312 18.7069 126.312 18.8387C126.312 18.9265 126.575 19.19 127.013 19.19C127.451 19.19 127.714 18.9265 127.714 18.7948C127.714 18.7069 127.451 18.4435 127.013 18.4435Z"
                                    fill="white"/>
                                <path
                                    d="M149.891 21.7807C151.005 21.7807 151.907 20.8763 151.907 19.7607C151.907 18.6451 151.005 17.7407 149.891 17.7407C148.778 17.7407 147.875 18.6451 147.875 19.7607C147.875 20.8763 148.778 21.7807 149.891 21.7807Z"
                                    fill="white"/>
                                <path
                                    d="M149.891 22.8786C148.182 22.8786 146.779 21.4734 146.779 19.7608C146.779 18.0482 148.182 16.6429 149.891 16.6429C151.6 16.6429 153.003 18.0482 153.003 19.7608C153.003 21.4734 151.6 22.8786 149.891 22.8786ZM149.891 18.8386C149.365 18.8386 148.971 19.2338 148.971 19.7608C148.971 20.2877 149.365 20.6829 149.891 20.6829C150.417 20.6829 150.811 20.2877 150.811 19.7608C150.811 19.2338 150.417 18.8386 149.891 18.8386Z"
                                    fill="white"/>
                                <path
                                    d="M149.891 23.2299C147.963 23.2299 146.429 21.649 146.429 19.7608C146.429 17.8725 148.006 16.2916 149.891 16.2916C151.776 16.2916 153.353 17.8725 153.353 19.7608C153.353 21.649 151.776 23.2299 149.891 23.2299ZM149.891 19.1899C149.584 19.1899 149.321 19.4534 149.321 19.7608C149.321 20.0681 149.584 20.3316 149.891 20.3316C150.198 20.3316 150.461 20.0681 150.461 19.7608C150.461 19.4534 150.198 19.1899 149.891 19.1899Z"
                                    fill="white"/>
                                <path
                                    d="M149.891 24.3278C147.349 24.3278 145.333 22.2638 145.333 19.7608C145.333 17.2578 147.393 15.1938 149.891 15.1938C152.389 15.1938 154.449 17.2578 154.449 19.7608C154.449 22.2638 152.389 24.3278 149.891 24.3278ZM149.891 17.3456C148.576 17.3456 147.524 18.3995 147.524 19.7169C147.524 21.0343 148.576 22.0882 149.891 22.0882C151.206 22.0882 152.258 21.0343 152.258 19.7169C152.258 18.3995 151.206 17.3456 149.891 17.3456ZM149.891 21.3856C148.971 21.3856 148.226 20.6391 148.226 19.7169C148.226 18.7947 148.971 18.0482 149.891 18.0482C150.811 18.0482 151.556 18.7947 151.556 19.7169C151.556 20.6391 150.811 21.3856 149.891 21.3856ZM149.891 19.1899C149.584 19.1899 149.365 19.4534 149.365 19.7169C149.365 20.3317 150.461 20.3317 150.461 19.7169C150.461 19.4095 150.198 19.1899 149.935 19.1899H149.891Z"
                                    fill="white"/>
                                <path
                                    d="M138.101 45.1866C128.985 45.1866 121.885 39.7414 118.554 30.2122C118.291 29.4657 118.686 28.5874 119.475 28.324C120.22 28.0605 121.096 28.4557 121.359 29.2461C122.937 33.8131 125.391 37.2383 128.678 39.4779C131.483 41.4101 134.946 42.3761 138.627 42.2444C146.823 42.0248 154.975 36.7114 156.816 30.344C157.035 29.5535 157.868 29.1144 158.613 29.334C159.402 29.5535 159.84 30.3879 159.621 31.1344C157.386 38.7753 148.182 44.9231 138.671 45.1866C138.496 45.1866 138.277 45.1866 138.101 45.1866Z"
                                    fill="white"/>
                                <path
                                    d="M138.101 45.7135C128.722 45.7135 121.403 40.1365 118.028 30.3439C117.853 29.817 117.897 29.29 118.116 28.807C118.335 28.3239 118.773 27.9726 119.255 27.797C119.737 27.6213 120.307 27.6652 120.789 27.8848C121.271 28.1044 121.622 28.5435 121.797 29.0266C123.331 33.4618 125.742 36.8431 128.898 38.9509C131.615 40.7952 134.99 41.7613 138.54 41.6296C146.472 41.4539 154.405 36.2722 156.246 30.1244C156.378 29.5974 156.728 29.2022 157.21 28.9387C157.692 28.6752 158.218 28.6313 158.744 28.7631C159.27 28.8948 159.665 29.2461 159.928 29.7292C160.191 30.2122 160.234 30.7392 160.103 31.2661C157.824 39.1265 148.401 45.45 138.627 45.7135H138.058H138.101ZM119.957 28.807C119.957 28.807 119.738 28.807 119.65 28.8509C119.431 28.9387 119.212 29.1144 119.124 29.3339C119.036 29.5535 118.992 29.817 119.124 30.0366C122.323 39.3461 129.248 44.6596 138.145 44.6596H138.715C148.006 44.44 156.991 38.4239 159.139 31.0026C159.226 30.7831 159.139 30.5196 159.051 30.3C158.92 30.0805 158.744 29.9487 158.525 29.8609C158.306 29.7731 158.043 29.8609 157.824 29.9487C157.605 30.0805 157.473 30.2561 157.386 30.4757C155.457 37.0626 147.086 42.5957 138.671 42.7713C138.496 42.7713 138.364 42.7713 138.189 42.7713C134.551 42.7713 131.177 41.7613 128.415 39.8731C125.041 37.5896 122.499 34.0765 120.877 29.3779C120.789 29.1583 120.614 28.9387 120.395 28.8509C120.263 28.807 120.132 28.7631 120 28.7631L119.957 28.807Z"
                                    fill="white"/>
                            </g>
                            <defs>
                                <clipPath id="clip0_27_770">
                                    <rect width="169" height="101" fill="white" transform="translate(0.613525)"/>
                                </clipPath>
                            </defs>
                        </svg>

                        <Tabs defaultActiveKey="1">
                            {this.renderTable(fromItems, "From You", 1)}
                            {this.renderTable(toItems, "To You", 2)}
                            {this.renderTable(awardsItems, "Awards", 3)}
                            {this.props.adminId?.includes(this.props.userId) && pendingItems.length > 0 && this.renderTable(allItems, "Pending", 4)}
                            {this.props.adminId?.includes(this.props.userId) && this.renderTable(allItems, "History", 5)}
                        </Tabs>
                    </div>
                </div>
            </div>
        );
    }
}
