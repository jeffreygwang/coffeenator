function MemoMsg(props) {
    return (
        <div style={{border:"2px solid", "border-radius":"5px", padding: "5px", margin: "5px"}}>
            <p style={{"font-weight":"bold"}}>&quot;{props.memo.message}&quot;</p>
            <p>From: {props.memo.name} at {props.memo.timestamp.toString()}</p>
        </div>
    );
}

export default MemoMsg;
