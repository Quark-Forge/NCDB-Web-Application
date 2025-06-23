import axios from "axios";
import { fetchUsersStart, fetchUsersSuccess, fetchUsersFailure } from "../slices/userSlice";

export const fetchUsers = () => async (dispatch) => {
  try {
    dispatch(fetchUsersStart());

    const response = await axios.get("http://localhost:5000/api/users"); // change to your real API endpoint
    dispatch(fetchUsersSuccess(response.data));
  } catch (error) {
    dispatch(fetchUsersFailure(error.message || "Something went wrong"));
  }
};
