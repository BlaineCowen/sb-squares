// When claiming a square:
const handleClaim = async (x, y, price) => {
  try {
    const response = await fetch(`/api/squares?gridCode=${gridCode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ x, y, price }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.error || "Failed to claim square");
    }

    // Update local state with new square data
    setSquares((prev) =>
      prev.map((sq) =>
        sq.x === x && sq.y === y ? { ...responseData, owner: session.user } : sq
      )
    );
  } catch (error) {
    console.error("Claim error:", error);
    alert(error.message);
  }
};

const handleApprove = async (squareId) => {
  try {
    const response = await fetch(`/api/squares/${squareId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to approve square");
    }

    // Update local state
    setSquares((prev) =>
      prev.map((sq) =>
        sq.id === squareId ? { ...sq, status: "APPROVED" } : sq
      )
    );
  } catch (error) {
    console.error("Approval error:", error);
    alert(error.message);
  }
};

const checkAdminStatus = async () => {
  try {
    const { data } = await axios.get(`/api/grids/${gridCode}/admin-status`);
    if (data.error) throw new Error(data.error);
    setIsAdmin(data.isAdmin);
  } catch (error) {
    console.error("Admin check failed:", error);
    setIsAdmin(false);
  }
};

{
  squares.map((square) => (
    <div
      key={square.id}
      className={`square ${square.status.toLowerCase()} ${
        square.x === 0 || square.y === 0 ? "axis" : ""
      }`}
      onClick={() => handleSquareClick(square.x, square.y)}
    >
      {square.status !== "AVAILABLE" && (
        <div className="square-details">
          <div className="owner">{square.owner?.name || "Anonymous"}</div>
          <div className="price">${square.price}</div>
          <div className="status">{square.status}</div>
        </div>
      )}
      {square.status !== "AVAILABLE" && (
        <div className="square-info">
          <div className="owner-name">{square.owner?.name || "Anonymous"}</div>
          <div className="square-status">{square.status}</div>
        </div>
      )}
      {isAdmin && square.status === "PENDING" && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleApprove(square.id);
          }}
          className="approve-button"
        >
          Approve
        </button>
      )}
    </div>
  ));
}
