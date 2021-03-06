import { Dispatch } from "redux";
import { SET_WEBSOCKET } from "../reducers/socket_reducer";
import { PayloadTypes } from "../enums";
import { SET_TYPING } from "../reducers/text_reducer";
import { WsPayload } from "./action_types";
import { transformChar } from "../util";
import { SET_APP_ERROR } from "../reducers/error_reducer";

function handleEvents(ws: WebSocket, dispatch: Dispatch) {
  ws.addEventListener("message", (msg) => {
    try {
      const data: WsPayload = JSON.parse(msg.data);
      console.log(data);
      if (!("type" in data)) throw "No type property in payload";
      switch (data.type) {
        case PayloadTypes.single_typing_text:
          const { text, time } = data.payload;
          dispatch({
            type: SET_TYPING,
            payload: {
              text: transformChar(text),
              duration: time || 120,
            },
          });
          break;
        case PayloadTypes.roomData:
          console.log("triggered roomdata");
      }
    } catch (e) {
      console.error(e);
    }
  });
}
export function setWs(isDev: boolean) {
  const aUrl = isDev
    ? `ws://localhost:1867/ws/`
    : `wss://${document.location.hostname}/ws/`;
  return (dispatch: Dispatch) => {
    const ws = new WebSocket(aUrl);

    ws.onopen = () => {
      console.log("ws opened");
      handleEvents(ws, dispatch);
      dispatch({
        type: SET_WEBSOCKET,
        payload: ws,
      });
    };
    ws.onerror = () =>
      dispatch({ type: SET_APP_ERROR, payload: "Error connecting to server" });
  };
}
