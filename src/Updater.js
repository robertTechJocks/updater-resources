import React from 'react';
import logo from './logo.svg';
import './App.css';
import Axios from 'axios';
import Dropdown from 'react-bootstrap/Dropdown';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';




function SelectPlayer(props)
{
    return (
        <Form>
            <Form.Group controlId="playerSelect">
                <Form.Label>Select a Player to Update</Form.Label>
                <Form.Control as="select" onChange={props.selectPlayer}>
                    <option disabled selected>Select a player</option>
                {props.players.map((player, i) => {
                    return (<option arrayKey={i} key={i} value={i}>{player.name}</option>) 
                })}
                </Form.Control>
            </Form.Group>
        </Form>
    );
}

class UpdateForm extends React.Component
{
    constructor(props) {
        super(props);
        this.state = {
            player: {}
        }
        this.updateAttribute = this.updateAttribute.bind(this);
        this.handleUpdatePlayer = this.handleUpdatePlayer.bind(this);
    }
    componentDidMount()
    {
        Axios.get(process.env.REACT_APP_API_URL+"/api/v1/players/"+this.props.player.id)
        .then(response => {
            this.setState({player: response.data})
        })
        .catch(error => {
            console.log(error);
        })
    }

    calculateTpeUpdateScale(value, attribute)
    {
        //40 + ((50 % $tpe)*2) right?
        let amt;
        //40 + ((50 % $tpe)*2) right?
        if(value < 60)
        {
            amt = 1;
        }
        else if(value < 70)
        {
            amt = 2;
        }
        else if(value < 80)
        {
            amt = 4;
        }
        else if(value < 90)
        {
            amt = 8;
        }
        else
        {
            amt = 12;
        }
        if(attribute === this.state.player.weakness)
        {
            if(this.state.player.player_type === "skater")
            {
                return this.calcWeaknessTPE(value);
            }
            else
            {
                return amt*2;
            }
        }
        else
        {
            return amt;
        }
    }

    calcWeaknessTPE(value)
    {
        if(value < 40)
        {
            return 1;
        }
        else if(value < 60)
        {
            return 2;
        }
        else if(value < 70)
        {
            return 6;
        }
        else
        {
            return 12;
        }
    }

    updateAttribute(attr)
    {
        let player = this.state.player;
        let tpeAmtToUpdate = this.calculateTpeUpdateScale(player.sim_stats[attr], attr);
        console.log(tpeAmtToUpdate);
        if(!player.restricted_tpe)
        {
            if(tpeAmtToUpdate <= player.free_tpe)
            {
                player.free_tpe -= tpeAmtToUpdate;
                player.sim_stats[attr]++;
            }
        }
        else
        {
            let attributesInRestrictedTPE = Object.keys(player.restricted_tpe);
            if(attributesInRestrictedTPE.includes(attr))
            {
                if(tpeAmtToUpdate <= player.restricted_tpe[attr])
                {
                    player.restricted_tpe[attr] -= tpeAmtToUpdate;
                    player.sim_stats[attr]++;
                }
                else
                {
                    tpeAmtToUpdate -= player.restricted_tpe[attr];
                    player.restricted_tpe[attr] = 0;
                    player.free_tpe -= tpeAmtToUpdate;
                    player.sim_stats[attr]++;
                }
            }
            else
            {
                player.free_tpe -= tpeAmtToUpdate;
                player.sim_stats[attr]++;
            }
        }

        this.setState({player: player});
    }

    handleUpdatePlayer()
    {
        /*Axios.post(process.env.REACT_APP_API_URL+"/api/v1/players/"+this.props.player.id+"/attributes", this.state.player)
        .then(response => {
            console.log(response);
        })
        .catch(error => {
            console.log(error);
        })*/
    }

    render()
    {
        console.log(this.props);
        let block = <SkaterAttributesBlock player={this.state.player} updateAttribute={this.updateAttribute}></SkaterAttributesBlock>;
        return(
            <Container fluid="true">
                <Row>
                    <Col xs={12}>
                        <h1>Update Your Player</h1>
                    </Col>
                </Row>
                <Row>
                    <Col xs={6}>
                        <PlayerBlock player={this.state.player}></PlayerBlock>
                    </Col>
                    <Col xs={6}>
                        <TpeBlock player={this.state.player}></TpeBlock>
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        {block}
                    </Col>
                </Row>
            </Container>
        )
    }
}

class GoalieAttributesBlock extends React.Component
{
    constructor(props) {
        super(props);
        this.state = {
        }
        this.checkTpeAmount = this.checkTpeAmount.bind(this);
    }

    calculateTpeUpdateScale(value, attribute)
    {
        let amt;
        //40 + ((50 % $tpe)*2) right?
        if(value < 60)
        {
            amt = 1;
        }
        else if(value < 70)
        {
            amt = 2;
        }
        else if(value < 80)
        {
            amt = 4;
        }
        else if(value < 90)
        {
            amt = 8;
        }
        else
        {
            amt = 12;
        }

        if(attribute === this.props.player.weakness)
        {
            return amt*2;
        }
        else
        {
            return amt;
        }
    }

    calcWeaknessTPE(value)
    {
        return value * 2;
    }

    checkTpeAmount(attribute, value)
    {
        if(!this.checkCappedAttribute(attribute))
        {
            return false;
        }
        if(!this.props.player.restricted_tpe)
        {
            if(value <= this.props.player.free_tpe)
            {
                return false;
            }
        }
        else
        {
            let attributesInRestrictedTPE = Object.keys(this.props.player.restricted_tpe);
            if(attributesInRestrictedTPE.includes(attribute))
            {
                console.log("we should see this");
                console.log((this.props.player.restricted_tpe[attribute] + this.props.player.free_tpe))
                return value <= (this.props.player.restricted_tpe[attribute] + this.props.player.free_tpe);
            }
            else
            {
                return value <= this.props.player.free_tpe;
            }
        }
    }

    checkCappedAttribute(attribute)
    {
        let strengths = [this.props.player.strength_1, this.props.player.strength_2, this.props.player.strength_3];
        if(strengths.includes(attribute))
        {
            return this.props.player.sim_stats[attribute] < 99
        }
        else
        {
            return this.props.player.sim_stats[attribute] < 90
        }
    }

    generateAttributeLabel(attribute)
    {
        let strengths = [this.props.player.strength_1, this.props.player.strength_2, this.props.player.strength_3];
        let weakness = this.props.player.weakness;
        if(attribute === weakness)
        {
            return <Alert style={{marginBottom:"0px"}} variant="danger">Weakness</Alert>
        }
        else if(strengths.includes(attribute))
        {
            return <Alert style={{marginBottom:"0px"}} variant="success">Strength</Alert>
        }
        else
        {
            return <Alert style={{marginBottom:"0px", visibility:"hidden"}} variant="success">Strength</Alert>;
        }
    }

    render()
    {
        let attributes;
        if(this.props.player.sim_stats)
        {
            attributes = Object.keys(this.props.player.sim_stats).map((attribute, i) => {
                let amtToUpdate = this.calculateTpeUpdateScale(this.props.player.sim_stats[attribute], attribute);
                let checkAmount = this.checkTpeAmount(attribute, amtToUpdate);
                let notCapped = this.checkCappedAttribute(attribute);
                let attributeLabel = this.generateAttributeLabel(attribute);
                let buttonText;
                if(notCapped)
                {
                    buttonText = "+1 for "+amtToUpdate+" TPE";
                }
                else
                {
                    buttonText = "Attribute Capped";
                }
                return (<Row key={i} style={{paddingBottom: "10px", paddingTop: "10px", borderBottom: "1px solid"}}>
                    <Col className="align-self-center" xs={6} md={2}>{attribute}: {this.props.player.sim_stats[attribute]}</Col>
                    <Col className="align-self-center" xs={6} md={4}><Button disabled={!checkAmount} onClick={() => this.props.updateAttribute(attribute)}>{buttonText}</Button></Col>
                    <Col className="align-self-center" xs={6} md={6}><div style={{width:"120px", float:"right"}}>{attributeLabel}</div></Col>

                </Row>) 
            })
        }
        else
        {
            attributes = <p>Fetching...</p>
        }
       return(<Card>
        <Card.Header>Attributes</Card.Header>
        <Card.Body>
          <Card.Text>
            {attributes}
          </Card.Text>
        </Card.Body>
      </Card>)
    }
}

class SkaterAttributesBlock extends React.Component
{
    constructor(props) {
        super(props);
        this.state = {
        }
        this.checkTpeAmount = this.checkTpeAmount.bind(this);
        this.updateMulti = this.updateMulti.bind(this);
    }

    calculateTpeUpdateScale(value, attribute)
    {
        //40 + ((50 % $tpe)*2) right?
        let amt;
        if(value < 60)
        {
            amt = 1;
        }
        else if(value < 70)
        {
            amt = 2;
        }
        else if(value < 80)
        {
            amt = 4;
        }
        else if(value < 90)
        {
            amt = 8;
        }
        else
        {
            amt = 12;
        }
        if(attribute === this.props.player.weakness)
        {
            if(this.props.player.player_type === "skater")
            {
                return this.calcWeaknessTPE(value);
            }
            else
            {
                return amt*2;
            }
        }
        else
        {
            return amt;
        }
    }

    calcWeaknessTPE(value)
    {
        if(value < 40)
        {
            return 1;
        }
        else if(value < 60)
        {
            return 2;
        }
        else if(value < 70)
        {
            return 6;
        }
        else
        {
            return 12;
        }
    }

    checkTpeAmount(attribute, value)
    {
        if(!this.checkCappedAttribute(attribute))
        {
            return false;
        }
        if(!this.props.player.restricted_tpe)
        {
            return value <= this.props.player.free_tpe;
        }
        else
        {
            let attributesInRestrictedTPE = Object.keys(this.props.player.restricted_tpe);
            if(attributesInRestrictedTPE.includes(attribute))
            {
                return value <= (this.props.player.restricted_tpe[attribute] + this.props.player.free_tpe);
            }
            else
            {
                return value <= this.props.player.free_tpe;
            }
        }
    }

    checkCappedAttribute(attribute)
    {
        let strengths = [this.props.player.strength_1, this.props.player.strength_2, this.props.player.strength_3];
        let weakness = this.props.player.weakness;
        if(attribute === weakness)
        {
            return this.props.player.sim_stats[attribute] < 85
        }
        else if(strengths.includes(attribute))
        {
            return this.props.player.sim_stats[attribute] < 99
        }
        else
        {
            return this.props.player.sim_stats[attribute] < 90
        }
    }

    checkCappedAttributeMulti(attribute, steps)
    {
        let strengths = [this.props.player.strength_1, this.props.player.strength_2, this.props.player.strength_3];
        let weakness = this.props.player.weakness;
        if(attribute === weakness)
        {
            return this.props.player.sim_stats[attribute] < 85-steps+1;
        }
        else if(strengths.includes(attribute))
        {
            return this.props.player.sim_stats[attribute] < 99-steps+1;
        }
        else
        {
            return this.props.player.sim_stats[attribute] < 90-steps+1;
        }
    }

    generateAttributeLabel(attribute)
    {
        let strengths = [this.props.player.strength_1, this.props.player.strength_2, this.props.player.strength_3];
        let weakness = this.props.player.weakness;
        if(attribute === weakness)
        {
            return <Alert style={{marginBottom:"0px"}} variant="danger">Weakness</Alert>
        }
        else if(strengths.includes(attribute))
        {
            return <Alert style={{marginBottom:"0px"}} variant="success">Strength</Alert>
        }
        else
        {
            return <Alert style={{marginBottom:"0px", visibility:"hidden"}} variant="success">Strength</Alert>;
        }
    }

    plusMulti(value, attribute, steps)
    {
        let total = 0;
        for (let index = 0; index < steps; index++) {
            total += this.calculateTpeUpdateScale(value+index, attribute);
        }
        return total;
    }

    updateMulti(attribute, steps)
    {
        for (let index = 0; index < steps; index++) {
            this.props.updateAttribute(attribute)
        }
    }

    render()
    {
        let attributes;
        if(this.props.player.sim_stats)
        {
            attributes = Object.keys(this.props.player.sim_stats).map((attribute, i) => {
                let amtToUpdate = this.calculateTpeUpdateScale(this.props.player.sim_stats[attribute], attribute);
                let checkAmount = this.checkTpeAmount(attribute, amtToUpdate);
                let notCapped = this.checkCappedAttribute(attribute);
                let attributeLabel = this.generateAttributeLabel(attribute);
                let buttonText;
                let plusFive = null;
                let plusTen = null;
                if(notCapped)
                {
                    buttonText = "+1 for "+amtToUpdate+" TPE";
                }
                else
                {
                    buttonText = "Attribute Capped";
                }
                if(this.props.player.free_tpe > 100)
                {
                    plusFive = {};
                    plusFive.amt = this.plusMulti(this.props.player.sim_stats[attribute], attribute, 5);
                    if(this.checkCappedAttributeMulti(attribute, 5))
                    {
                        plusFive.text = "+5 for "+plusFive.amt+" TPE";
                    }
                    else
                    {
                        plusFive = null;
                    }

                    plusTen = {};
                    plusTen.amt = this.plusMulti(this.props.player.sim_stats[attribute], attribute, 10);
                    if(this.checkCappedAttributeMulti(attribute, 10))
                    {
                        plusTen.text = "+10 for "+plusTen.amt+" TPE";
                    }
                    else
                    {
                        plusTen = null;
                    }
                }
                return (<Col xs={12} md={6} key={i}>
                    <Row style={{paddingBottom: "10px", paddingTop: "10px", borderBottom: "1px solid", marginLeft: "5px"}}>
                        <Col className="align-self-center" xs={6} md={2}>{attribute}: {this.props.player.sim_stats[attribute]}</Col>
                        <Col className="align-self-center" xs={6} md={2}><Button disabled={!checkAmount} onClick={() => this.props.updateAttribute(attribute)}>{buttonText}</Button></Col>
                        {plusFive && <Col className="align-self-center" xs={6} md={2}><Button disabled={!checkAmount} onClick={() => this.updateMulti(attribute, 5)}>{plusFive.text}</Button></Col>}
                        {plusTen && <Col className="align-self-center" xs={6} md={2}><Button disabled={!checkAmount} onClick={() => this.updateMulti(attribute, 10)}>{plusTen.text}</Button></Col>}
                        <Col className="align-self-center" xs={6} md={4}><div style={{width:"120px", float:"right"}}>{attributeLabel}</div></Col>
                    </Row>
                </Col>) 
            })
        }
        else
        {
            attributes = <p>Fetching...</p>
        }
       return(<Card>
        <Card.Header>Attributes</Card.Header>
        <Card.Body>
            <Row>
                {attributes}
            </Row>
        </Card.Body>
      </Card>)
    }
}

class TpeBlock extends React.Component
{
    constructor(props) {
        super(props);
        this.state = {
        }
    }
    render()
    {
        let restrictedTPE;
        if(this.props.player.restricted_tpe)
        {
            restrictedTPE = Object.keys(this.props.player.restricted_tpe).map((key, i) => {
                return (<p key={i}>{key}: {this.props.player.restricted_tpe[key]}</p>) 
            })
        }
        else
        {
            restrictedTPE = <p>No restricted TPE available</p>
        }
       return(<Card>
        <Card.Header>TPE Info:</Card.Header>
        <Card.Body>
          <Card.Title>TPE Info:</Card.Title>
          <Card.Text>
            <div>Banked TPE: {this.props.player.free_tpe}</div>
            <div>Restricted TPE: {restrictedTPE}</div>
          </Card.Text>
        </Card.Body>
      </Card>)
    }
}

class PlayerBlock extends React.Component
{
    constructor(props) {
        super(props);
        this.state = {
        }
    }
    render()
    {
       return(<Card>
        <Card.Header>Player Info:</Card.Header>
        <Card.Body>
          <Card.Text>
            <div>Name: {this.props.player.name}</div>
            <div>Type: {this.props.player.player_type}</div>
            <div>Strengths: {this.props.player.strength_1}, {this.props.player.strength_2}, {this.props.player.strength_3}</div>
            <div>Weakness: {this.props.player.weakness}</div>
          </Card.Text>
        </Card.Body>
      </Card>)
    }
}

class Updater extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userID: null,
            players: []
        }
        this.selectPlayer = this.selectPlayer.bind(this);
    }
    componentDidMount()
    {
        Axios.get(process.env.REACT_APP_API_URL+"/api/v1/users/"+this.props.userID+"/players")
        .then(response => {
            if(response.data.length === 1)
            {
                this.setState({selectedPlayer: response.data[0], players: response.data});
            }
            else
            {
                this.setState({players: response.data});
            }
        })
        .catch(error => {
            console.log(error);
        })
    }

    selectPlayer(e)
    {
        let player = this.state.players[e.target.value];
        this.setState({selectedPlayer: player})
    }

    render()
    {
        let show = null;
        if(this.state.selectedPlayer)
        {
            show = <UpdateForm player={this.state.selectedPlayer}></UpdateForm>
        }
        else if(this.state.players.length > 1)
        {
            show = (<div className="App"> 
            <header className="App-header">
                <SelectPlayer selectPlayer={this.selectPlayer} players={this.state.players}></SelectPlayer>
            </header>
        </div>)
        }
        return show;
    }
}


export default Updater;
