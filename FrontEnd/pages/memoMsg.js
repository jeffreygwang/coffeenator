function MemoMsg(props) {
    return (
        <div key={props.idx} style={{border:"2px solid", "border-radius":"5px", padding: "5px", margin: "5px"}}>
            <p style={{"font-weight":"bold"}}>"{props.memo.message}"</p>
            <p>From: {props.memo.name} at {props.memo.timestamp.toString()}</p>
        </div>
        );
}

export default MemoMsg;
