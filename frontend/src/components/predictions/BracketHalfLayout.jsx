import {
  BRACKET_SLOT_COUNT,
  LEFT_QF,
  LEFT_R16,
  LEFT_R32,
  LEFT_SF,
  RIGHT_QF,
  RIGHT_R16,
  RIGHT_R32,
  RIGHT_SF,
  bracketGridSlot,
} from "../../utils/knockoutBracketLayout.js";

function Connector({ mirrored }) {
  return (
    <div
      className={`bracket-connector w-5 xl:w-6 shrink-0 h-full flex items-center ${
        mirrored ? "justify-end" : "justify-start"
      }`}
      aria-hidden
    >
      <div
        className={`h-1/2 w-1/2 border-[#c5ddd8] ${
          mirrored ? "border-l border-t border-b" : "border-r border-t border-b"
        }`}
      />
    </div>
  );
}

function GridSlot({ rowStart, rowSpan, mirrored, children }) {
  return (
    <div
      className={`flex items-center min-h-0 ${mirrored ? "justify-end" : "justify-start"}`}
      style={{ gridRow: `${rowStart} / ${rowStart + rowSpan}` }}
    >
      {children}
    </div>
  );
}

function RoundLabel({ long, short }) {
  return (
    <span className="bracket-round-label mb-2 whitespace-nowrap text-center">
      <span className="bracket-round-label--long">{long}</span>
      <span className="bracket-round-label--short">{short}</span>
    </span>
  );
}

function RoundGrid({ label, shortLabel, children }) {
  return (
    <div className="flex flex-col shrink-0 self-stretch">
      <RoundLabel long={label} short={shortLabel} />
      <div
        className="bracket-round-grid grid flex-1"
        style={{
          gridTemplateRows: `repeat(${BRACKET_SLOT_COUNT}, minmax(0, 1fr))`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function ConnectorGrid({ mirrored, slots }) {
  return (
    <div
      className="bracket-round-grid grid shrink-0 self-stretch"
      style={{
        gridTemplateRows: `repeat(${BRACKET_SLOT_COUNT}, minmax(0, 1fr))`,
      }}
    >
      {slots.map(({ rowStart, rowSpan }, index) => (
        <GridSlot key={index} rowStart={rowStart} rowSpan={rowSpan} mirrored={mirrored}>
          <Connector mirrored={mirrored} />
        </GridSlot>
      ))}
    </div>
  );
}

export default function BracketHalfLayout({ side, renderMatch }) {
  const mirrored = side === "right";
  const r32Indices = side === "left" ? LEFT_R32 : RIGHT_R32;
  const r16Indices = side === "left" ? LEFT_R16 : RIGHT_R16;
  const qfIndices = side === "left" ? LEFT_QF : RIGHT_QF;
  const sfIndex = side === "left" ? LEFT_SF : RIGHT_SF;

  const r16ConnectorSlots = r16Indices.map((_, i) => bracketGridSlot("r16", i));
  const qfConnectorSlots = qfIndices.map((_, i) => bracketGridSlot("qf", i));
  const sfConnectorSlot = bracketGridSlot("sf", 0);

  return (
    <div className={`flex items-stretch ${mirrored ? "flex-row-reverse" : ""}`}>
      <RoundGrid label="Round of 32" shortLabel="R32">
        {r32Indices.map((idx, i) => {
          const { rowStart, rowSpan } = bracketGridSlot("r32", i);
          return (
            <GridSlot key={idx} rowStart={rowStart} rowSpan={rowSpan} mirrored={mirrored}>
              {renderMatch("round_of_32", idx)}
            </GridSlot>
          );
        })}
      </RoundGrid>

      <ConnectorGrid mirrored={mirrored} slots={r16ConnectorSlots} />

      <RoundGrid label="Round of 16" shortLabel="R16">
        {r16Indices.map((idx, i) => {
          const { rowStart, rowSpan } = bracketGridSlot("r16", i);
          return (
            <GridSlot key={idx} rowStart={rowStart} rowSpan={rowSpan} mirrored={mirrored}>
              {renderMatch("round_of_16", idx)}
            </GridSlot>
          );
        })}
      </RoundGrid>

      <ConnectorGrid mirrored={mirrored} slots={qfConnectorSlots} />

      <RoundGrid label="Quarter-Final" shortLabel="QF">
        {qfIndices.map((idx, i) => {
          const { rowStart, rowSpan } = bracketGridSlot("qf", i);
          return (
            <GridSlot key={idx} rowStart={rowStart} rowSpan={rowSpan} mirrored={mirrored}>
              {renderMatch("quarter_final", idx)}
            </GridSlot>
          );
        })}
      </RoundGrid>

      <ConnectorGrid mirrored={mirrored} slots={[sfConnectorSlot]} />

      <RoundGrid label="Semi-Final" shortLabel="SF">
        {(() => {
          const { rowStart, rowSpan } = bracketGridSlot("sf", 0);
          return (
            <GridSlot rowStart={rowStart} rowSpan={rowSpan} mirrored={mirrored}>
              {renderMatch("semi_final", sfIndex)}
            </GridSlot>
          );
        })()}
      </RoundGrid>
    </div>
  );
}
