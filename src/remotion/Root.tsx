import React from "react";
import { Composition } from "remotion";
import { DynamicComp } from "./DynamicComp";
import { TraggoVideo } from "./TraggoVideo";
import { TraggoVideoPt } from "./TraggoVideoPt";
import { TraggoVideoIt } from "./TraggoVideoIt";
import { TraggoVideoFr } from "./TraggoVideoFr";
import { TraggoVideoEs } from "./TraggoVideoEs";
import { TraggoVideoPl } from "./TraggoVideoPl";
import { TraggoVideoDe } from "./TraggoVideoDe";

const defaultCode = `import { AbsoluteFill } from "remotion";
export const MyAnimation = () => <AbsoluteFill style={{ backgroundColor: "#000" }} />;`;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="DynamicComp"
        component={DynamicComp}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ code: defaultCode }}
        calculateMetadata={({ props }) => ({
          durationInFrames: props.durationInFrames as number,
          fps: props.fps as number,
        })}
      />
      <Composition
        id="TraggoVideo"
        component={TraggoVideo}
        durationInFrames={1980}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="TraggoVideoPt"
        component={TraggoVideoPt}
        durationInFrames={1800}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="TraggoVideoIt"
        component={TraggoVideoIt}
        durationInFrames={1800}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="TraggoVideoFr"
        component={TraggoVideoFr}
        durationInFrames={1800}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="TraggoVideoEs"
        component={TraggoVideoEs}
        durationInFrames={1800}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="TraggoVideoPl"
        component={TraggoVideoPl}
        durationInFrames={1800}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="TraggoVideoDe"
        component={TraggoVideoDe}
        durationInFrames={1800}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
