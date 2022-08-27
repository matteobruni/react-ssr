import * as React from "react";
import "./StrokeWidthTool.scss";
import { Color, Room, RoomState} from "white-web-sdk";
import mask from "./image/mask.svg";

export default class StrokeWidthTool extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            percentage: props.room.state.memberState.strokeWidth / 32,
        };
    }

    rgbToHex = (rgb) => {
        return "#" +this.componentToHex(rgb[0]) + this.componentToHex(rgb[1]) + this.componentToHex(rgb[2]);
    }

    setStrokeWidth = (event) => {
        const {room, setRoom} = this.props;
        const percentage = event.target.value / 32;
        const strokeWidth = parseInt(event.target.value);
        this.setState({percentage: percentage});
        room.setMemberState({strokeWidth: strokeWidth});
        // setRoom(room);
    }


    componentToHex = (c) =>  {
        const hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    render() {
        const {room, roomState} = this.props;
        const strokeColor = room.state.memberState.strokeColor;
        return (
            <>
                <div className="tool-box-stroke-box">
                    <div className="tool-box-input-box">
                        <input className="palette-stroke-slider"
                               type="range"
                               min={1}
                               max={32}
                               onChange={this.setStrokeWidth}
                               defaultValue={roomState.memberState.strokeWidth}
                               onMouseUp={
                                   () => {
                                       room.setMemberState({strokeWidth: roomState.memberState.strokeWidth})
                                       // this.props.setRoom(room);
                                   }
                               }/>
                    </div>
                    <div className="tool-box-mask-box">
                        <img src={mask} alt={"mask"}/>
                    </div>
                    <div className="tool-box-under-box-2"
                         style={{
                             width: 156 * this.state.percentage,
                             backgroundColor: this.rgbToHex(strokeColor),
                         }}/>
                    <div className="tool-box-under-box"/>
                </div>
            </>
        );
    }
}
