import React from "react";
import {ApplianceNames, Color, Room, RoomState} from "white-web-sdk";
// import {Popover} from "antd";
import Popover from '@material-ui/core/Popover';
import Tooltip from '@material-ui/core/Tooltip';
import DrawTool from "./DrawTool";
import ColorTool from "./ColorTool";
import StrokeWidthTool from "./StrokeWidthTool";
import "./index.scss";
import selector from "./image/selector.svg";
import selectorActive from "./image/selector-active.svg";
import pen from "./image/pencil.svg";
import penActive from "./image/pencil-active.svg";
import text from "./image/text.svg";
import textActive from "./image/text-active.svg";
import eraser from "./image/eraser.svg";
import eraserActive from "./image/eraser-active.svg";
import arrow from "./image/arrow.svg";
import arrowActive from "./image/arrow-active.svg";
import laserPointer from "./image/laserPointer.svg";
import laserPointerActive from "./image/laserPointer-active.svg";
import hand from "./image/hand.svg";
import handActive from "./image/hand-active.svg";
import ellipse from "./image/ellipse.svg";
import ellipseActive from "./image/ellipse-active.svg";
import rectangle from "./image/rectangle.svg";
import rectangleActive from "./image/rectangle-active.svg";
import straight from "./image/straight.svg";
import straightActive from "./image/straight-active.svg";
import subscript from "./image/subscript.svg";
import subscriptActive from "./image/subscript-active.svg";
import clear from "./image/clear.svg";
import clearActive from "./image/clear-active.svg";
import click from "./image/click.svg";
import clickActive from "./image/click-active.svg";
import triangle from "./image/triangle.svg";
import triangleActive from "./image/triangle-active.svg";
import rhombus from "./image/rhombus.svg";
import rhombusActive from "./image/rhombus-active.svg";
import pentagram from "./image/pentagram.svg";
import pentagramActive from "./image/pentagram-active.svg";
import speechBalloon from "./image/speechBalloon.svg";
import speechBalloonActive from "./image/speechBalloon-active.svg";

const zhCN = {
    [ApplianceNames.clicker]: "点击",
    [ApplianceNames.arrow]: "箭头",
    [ApplianceNames.ellipse]: "椭圆",
    [ApplianceNames.eraser]: "橡皮擦",
    [ApplianceNames.hand]: "抓手",
    [ApplianceNames.laserPointer]: "激光笔",
    [ApplianceNames.pencil]: "笔",
    [ApplianceNames.rectangle]: "矩形",
    [ApplianceNames.selector]: "选择",
    [ApplianceNames.shape]: "形状",
    [ApplianceNames.straight]: "直线",
    [ApplianceNames.text]: "文本",
    clear: "清屏",
};

export default class ToolBox extends React.Component {
    static descriptions = Object.freeze({
        clicker: Object.freeze({
            icon: click,
            iconActive: clickActive,
        }),
        selector: Object.freeze({
            icon: selector,
            iconActive: selectorActive,
        }),
        pencil: Object.freeze({
            icon: pen,
            iconActive: penActive,
        }),
        text: Object.freeze({
            icon: text,
            iconActive: textActive,
        }),
        shape_triangle: Object.freeze({
            icon: triangle,
            iconActive: triangleActive,
            shapeType: "triangle",
        }),
        shape_speechBalloon: Object.freeze({
            icon: speechBalloon,
            iconActive: speechBalloonActive,
            shapeType: "speechBalloon",
        }),
        shape_rhombus: Object.freeze({
            icon: rhombus,
            iconActive: rhombusActive,
            shapeType: "rhombus",
        }),
        shape_pentagram: Object.freeze({
            icon: pentagram,
            iconActive: pentagramActive,
            shapeType: "pentagram",
        }),
        eraser: Object.freeze({
            icon: eraser,
            iconActive: eraserActive,
        }),
        ellipse: Object.freeze({
            icon: ellipse,
            iconActive: ellipseActive,
        }),
        rectangle: Object.freeze({
            icon: rectangle,
            iconActive: rectangleActive,
        }),
        straight: Object.freeze({
            icon: straight,
            iconActive: straightActive,
        }),
        arrow: Object.freeze({
            icon: arrow,
            iconActive: arrowActive,
        }),
        laserPointer: Object.freeze({
            icon: laserPointer,
            iconActive: laserPointerActive,
        }),
        hand: Object.freeze({
            icon: hand,
            iconActive: handActive,
        }),
    });

    currentDraw = ApplianceNames.pencil;
    currentDrawShape = "rhombus";

    constructor(props) {
        super(props);
        this.state = {
            strokeEnable: false,
            roomState: props.room.state,
            isClearActive: false,
            drawPopOver: false,
            colorPopOver: false,
            anchorEl: null
        };
    }

    getShape = (shape) => {
        const applianceObj = shape.split("_");
        const applianceName = applianceObj[0];
        const applianceShape = applianceObj[1];
        return {
            applianceName: applianceName,
            applianceShape: applianceShape,
        }
    }

    componentDidMount() {
        const {room} = this.props;
        room.callbacks.on("onRoomStateChanged", (modifyState) => {
            this.setState({roomState: {...room.state, ...modifyState}});
        });
    }

    clickAppliance = (applianceName, shapeType) => {
        const {room, setRoom} = this.props;
        if (applianceName.split("").includes("_")) {
            const applianceObj = this.getShape(applianceName);
            room.setMemberState({
                currentApplianceName: applianceObj.applianceName,
                shapeType: applianceObj.applianceShape});
        } else {
            room.setMemberState({currentApplianceName: applianceName, shapeType: shapeType});
        }
        // setRoom(room);
    }

    renderButton = (applianceName, description) => {

        const {roomState} = this.state;
        const currentApplianceName = roomState.memberState.currentApplianceName;
        const isSelected = currentApplianceName === applianceName;
        const iconUrl = isSelected ? description.iconActive : description.icon;
        const cell = (
          <div key={`${applianceName}`} className="tool-box-cell-box-left">
              <div className="tool-box-cell"
                   onClick={() => this.clickAppliance(applianceName)}>
                  <img src={iconUrl} alt={"iconUrl"}/>
              </div>
          </div>
        );
        return (
          <Tooltip placement={"right"} key={applianceName} title={this.getApplianceName(applianceName)}>
              {cell}
          </Tooltip>
        );
    }

    addCustomerComponent = (nodes) => {
        if (this.props.customerComponent) {
            const customerNodes = this.props.customerComponent.map((data, index) => {
                return <div key={`tool-customer-${index}`}>{data}</div>;
            });
            nodes.push(...customerNodes);
            return nodes;
        } else {
            return nodes;
        }
    }

    isDraw = (applianceName) => {
        if (applianceName.split("").includes("_")) {
            return true;
        } else {
            return applianceName === ApplianceNames.pencil || applianceName === ApplianceNames.ellipse ||
              applianceName === ApplianceNames.rectangle || applianceName === ApplianceNames.straight
        }
    }

    getApplianceName(name) {
        const hotkeys = this.props.hotkeys || {};
        let tooltip = "";
        if (this.props.i18nLanguage === "zh-CN" && zhCN[name]) {
            tooltip = zhCN[name];
        } else {
            if (name === ApplianceNames.hand) {
                tooltip = "Drag";
            } else {
                tooltip = name
                  .replace(/[A-Z]/g, (e) => ` ${e.toLowerCase()}`)
                  .split(" ")
                  .map((e) => e[0].toUpperCase() + e.substring(1))
                  .join(" ");
            }
        }
        if (hotkeys[name]) {
            tooltip += ` / ${hotkeys[name]}`;
        }
        return tooltip;
    }

    renderNodes = () => {
        const nodes = [];
        const {roomState} = this.state;
        const currentApplianceName = roomState.memberState.currentApplianceName;
        const currentShapeType = roomState.memberState.shapeType;
        for (const applianceName in ToolBox.descriptions) {
            const description = ToolBox.descriptions[applianceName];
            if (this.isDraw(applianceName)) {
                if (currentApplianceName === applianceName) {
                    this.currentDraw = applianceName;
                }
                if (applianceName.split("").includes("_")) {
                    const applianceObj = this.getShape(applianceName);
                    // this.currentDraw = ApplianceNames.shape;
                    if (currentShapeType === applianceObj.applianceShape) {
                        this.currentDrawShape = applianceObj.applianceShape;
                    }
                } else {
                    if (currentApplianceName === applianceName) {
                        this.currentDraw = applianceName;
                    }
                }
            } else {
                const node = this.renderButton(applianceName, description);
                nodes.push(node);
            }
        }
        return nodes
    }

    componentToHex = (c) =>  {
        const hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    rgbToHex = (rgb) => {
        return "#" +this.componentToHex(rgb[0]) + this.componentToHex(rgb[1]) + this.componentToHex(rgb[2]);
    }

    renderDrawContext = (closePopover) => {
        const {roomState} = this.state;
        return (
          <DrawTool selectAppliance={(...args) => {
              this.clickAppliance(...args);
              closePopover();
          }} roomState={roomState} />
        );
    }

    openDrawPopover = (e) => {
        this.setState({drawPopOver: true, anchorEl: e.currentTarget});
    }

    closeDrawPopover = (e) => {
        this.setState({drawPopOver: false, anchorEl: null});
    }

    openColorPopover = (e) => {
        this.setState({colorPopOver: true, anchorEl: e.currentTarget});
    }

    closeColorPopover = (e) => {
        this.setState({colorPopOver: false, anchorEl: null});
    }

    renderDraw = () => {
        const {anchorEl, roomState, drawPopOver} = this.state;
        const currentApplianceName = roomState.memberState.currentApplianceName;
        if (currentApplianceName === ApplianceNames.shape) {
            const currentShapeType = roomState.memberState.shapeType;
            const description = ToolBox.descriptions[`${currentApplianceName}_${currentShapeType}`];
            const isSelected = currentShapeType === this.currentDrawShape;
            const iconUrl = isSelected ? description.iconActive : description.icon;
            const subscriptUrl = isSelected ? subscriptActive : subscript;
            return (
              <>
                  <div aria-describedby={'id'} key="draw-inner" className="tool-box-cell-box-left" onMouseEnter={this.openDrawPopover}>
                      <div className="tool-box-cell"
                           onClick={() => this.clickAppliance(this.currentDraw)}>
                          <img src={iconUrl} alt={"iconUrl"}/>
                          <img className="tool-box-cell-subscript" src={subscriptUrl} alt={"subscriptUrl"}/>
                      </div>
                  </div>
                  <Popover
                    id={'id'}
                    open={drawPopOver}
                    anchorEl={anchorEl}
                    onClose={this.closeDrawPopover}
                    onMouseLeave={this.closeDrawPopover}
                    anchorOrigin={{
                        vertical: 'center',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'center',
                        horizontal: 'left',
                    }}
                  >
                      {this.renderDrawContext(this.closeDrawPopover)}
                  </Popover>
              </>
              // <Popover key={"draw"}
              //          placement={"right"}
              //          trigger="hover"
              //          content={this.renderDrawContext}>
              //     <div key="draw-inner" className="tool-box-cell-box-left">
              //         <div className="tool-box-cell"
              //              onClick={() => this.clickAppliance(this.currentDraw)}>
              //             <img src={iconUrl} alt={"iconUrl"}/>
              //             <img className="tool-box-cell-subscript" src={subscriptUrl} alt={"subscriptUrl"}/>
              //         </div>
              //     </div>
              // </Popover>
            );
        } else {
            const description = ToolBox.descriptions[this.currentDraw]
            const isSelected = currentApplianceName === this.currentDraw;
            const iconUrl = isSelected ? description.iconActive : description.icon;
            const subscriptUrl = isSelected ? subscriptActive : subscript;
            return (
              <>
                  <div aria-describedby={'id'} key="draw-inner" className="tool-box-cell-box-left" onMouseEnter={this.openDrawPopover}>
                      <div className="tool-box-cell"
                           onClick={() => this.clickAppliance(this.currentDraw)}>
                          <img src={iconUrl} alt={"iconUrl"}/>
                          <img className="tool-box-cell-subscript" src={subscriptUrl} alt={"subscriptUrl"}/>
                      </div>
                  </div>
                  <Popover
                    id={'id'}
                    open={drawPopOver}
                    anchorEl={anchorEl}
                    onClose={this.closeDrawPopover}
                    onMouseLeave={this.closeDrawPopover}
                    anchorOrigin={{
                        vertical: 'center',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'center',
                        horizontal: 'left',
                    }}
                  >
                      {this.renderDrawContext(this.closeDrawPopover)}
                  </Popover>
              </>
              // <Popover key={"draw"}
              //          placement={"right"}
              //          trigger="hover"
              //          content={this.renderDrawContext}>
              //     <div key="draw-inner" className="tool-box-cell-box-left">
              //         <div className="tool-box-cell"
              //              onClick={() => this.clickAppliance(this.currentDraw)}>
              //             <img src={iconUrl} alt={"iconUrl"}/>
              //             <img className="tool-box-cell-subscript" src={subscriptUrl} alt={"subscriptUrl"}/>
              //         </div>
              //     </div>
              // </Popover>
            );
        }
    }

    renderColorContext = () => {
        const {room} = this.props;
        const {roomState} = this.state
        return (
          <div className="palette-box">
              <StrokeWidthTool room={room} setRoom={this.props.setRoom} roomState={roomState} />
              <ColorTool room={room} setRoom={this.props.setRoom} roomState={roomState}/>
          </div>
        );
    }

    renderColorCell = () => {
        const {room} = this.props;
        const {colorPopOver, anchorEl} = this.state;
        const strokeColor = room.state.memberState.strokeColor;
        return (
          <>
              <div key="draw-inner" className="tool-box-cell-box-left" onMouseEnter={this.openColorPopover}>
                  <div className="tool-box-cell"
                       onClick={() => this.clickAppliance(this.currentDraw)}>
                      <div className="tool-box-cell-color" style={{backgroundColor: this.rgbToHex(strokeColor)}}/>
                      <img className="tool-box-cell-subscript" src={subscript} alt={"subscriptUrl"}/>
                  </div>
              </div>
              <Popover
                id={'id'}
                open={colorPopOver}
                anchorEl={anchorEl}
                onClose={this.closeColorPopover}
                onMouseLeave={this.closeColorPopover}
                anchorOrigin={{
                    vertical: 'center',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'center',
                    horizontal: 'left',
                }}
              >
                  {this.renderColorContext()}
              </Popover>
          </>
          // <Popover key={"color"}
          //          placement={"right"}
          //          trigger="hover"
          //          content={this.renderColorContext}>
          // </Popover>
        );
    }

    renderCleanCell = () => {
        const {room} = this.props;
        const { isClearActive } = this.state;
        return (
          <Tooltip placement={"right"} key="clean" title={this.getApplianceName("clear")}>
              <div
                onMouseEnter={() => {
                    this.setState({ isClearActive: true });
                }}
                onMouseLeave={() => {
                    this.setState({ isClearActive: false });
                }}
                onClick={() => {
                    room.cleanCurrentScene();
                }}
                className="tool-box-cell-box-left"
              >
                  <div className="tool-box-cell">
                      <img src={isClearActive ? clearActive : clear} alt={"clear"} />
                  </div>
              </div>
          </Tooltip>
        );
    }

    render() {
        const nodes = this.renderNodes();
        nodes.splice(2, 0, this.renderDraw());
        nodes.push(this.renderColorCell());
        nodes.push(this.renderCleanCell())
        return (
          <div className="tool-mid-box-left">
              {this.addCustomerComponent(nodes)}
          </div>
        );
    }
}
