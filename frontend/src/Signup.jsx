import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { Card, Typography } from "@mui/material";
import { useState } from "react";
import { toast } from "react-hot-toast";
import {useNavigate} from "react-router-dom";

function Signup() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password || !firstName || !lastName) {
      toast.error("All fields are required!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/v1/user/signup", {
        method: "POST",
        body: JSON.stringify({ email, password, firstName, lastName }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          Array.isArray(data.error) ? data.error.join(", ") : data.message || "Signup failed"
        );
      }

      localStorage.setItem("token", data.token);
      toast.success("Signup successful!");
      navigate("/");
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div
        style={{
          paddingTop: 150,
          marginBottom: 10,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Typography variant="h6">
          Welcome to Course Selling App. Sign up below
        </Typography>
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Card variant="outlined" style={{ width: 400, padding: 20 }}>
          <TextField
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            fullWidth
            label="First Name"
            variant="outlined"
          />
          <br />
          <br />
          <TextField
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            fullWidth
            label="Last Name"
            variant="outlined"
          />
          <br />
          <br />
          <TextField
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            label="Email"
            variant="outlined"
            type="email"
          />
          <br />
          <br />
          <TextField
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            label="Password"
            variant="outlined"
            type="password"
          />
          <br />
          <br />
          <Button
            size="large"
            variant="contained"
            onClick={handleSignup}
            disabled={loading}
          >
            {loading ? "Signing up..." : "Signup"}
          </Button>
        </Card>
      </div>
    </div>
  );
}

export default Signup;
