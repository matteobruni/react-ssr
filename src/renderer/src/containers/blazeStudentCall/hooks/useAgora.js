import { useState, useEffect } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import { useMediaQuery } from "react-responsive";
import {getRTCToken} from "../../../database/agora/agora-functions";

export default function useAgora(client) {
  const [localVideoTrack, setLocalVideoTrack] = useState(undefined);
  const [localAudioTrack, setLocalAudioTrack] = useState(undefined);

  const [joinState, setJoinState] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState([]);

  const isSmall = useMediaQuery({ query: "(max-width: 600px)" });

  async function createLocalTracks() {
    let encoderConfig = { width: 1280, height: 720 };

    if (isSmall) {
      encoderConfig = { width: 360, height: 640 };
    }
    const [microphoneTrack, cameraTrack] =
      await AgoraRTC.createMicrophoneAndCameraTracks("", { encoderConfig });

    setLocalVideoTrack(cameraTrack);
    setLocalAudioTrack(microphoneTrack);
    return [microphoneTrack, cameraTrack];
  }

  async function join(appid, channel, token, uid, cb) {
    if (!client) return;
    const [microphoneTrack, cameraTrack] = await createLocalTracks();

    // channel = 'MXXKmEoVQOHtBFclQTRH';

    const res = await getRTCToken(true, uid, channel);

    const token1 = res.data.key;

    console.log('appid, channel, token1 || null, uid - ', appid, channel, token1 || null, uid);

    await client.join(appid, channel, token1 || null, uid)
      .then(cb);
    await client.publish([microphoneTrack, cameraTrack]);

    window.client = client;
    window.videoTrack = cameraTrack;

    setJoinState(true);
  }

  async function leave(notMounted) {
    if (localAudioTrack) {
      localAudioTrack.stop();
      localAudioTrack.close();
    }
    if (localVideoTrack) {
      localVideoTrack.stop();
      localVideoTrack.close();
    }
    if(!notMounted) {
      setRemoteUsers([]);
      setJoinState(false);
    }
    await client?.leave();
  }

  useEffect(() => {
    if (!client) return;
    setRemoteUsers(client.remoteUsers);

    const handleUserPublished = async (user, mediaType) => {
      await client.subscribe(user, mediaType);
      console.log('Subscribed - -- - -- - ', client);
      // toggle rerender while state of remoteUsers changed.
      setRemoteUsers((remoteUsers) => Array.from(client.remoteUsers));
    };

    const handleUserUnpublished = (user) => {
      setRemoteUsers((remoteUsers) => Array.from(client.remoteUsers));
    };

    const handleUserJoined = (user) => {
      setRemoteUsers((remoteUsers) => Array.from(client.remoteUsers));
    };

    const handleUserLeft = (user) => {
      setRemoteUsers((remoteUsers) => Array.from(client.remoteUsers));
    };

    client.on("user-published", handleUserPublished);
    client.on("user-unpublished", handleUserUnpublished);
    client.on("user-joined", handleUserJoined);
    client.on("user-left", handleUserLeft);

    return () => {
      client.off("user-published", handleUserPublished);
      client.off("user-unpublished", handleUserUnpublished);
      client.off("user-joined", handleUserJoined);
      client.off("user-left", handleUserLeft);
    };
  }, [client]);

  const toggleAudio = (status) => {
    try {
      localAudioTrack.setEnabled(status);
    } catch (error) {}
  };
  const toggleVideo = (status) => {
    try {
      localVideoTrack.setEnabled(status);
    } catch (error) {}
  };

  return {
    localAudioTrack,
    localVideoTrack,
    joinState,
    leave,
    join,
    remoteUsers,
    toggleAudio,
    toggleVideo,
  };
}
