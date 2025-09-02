/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EditProfileForm from "./EditProfileForm";
import { updateProfile } from "firebase/auth";
import { getDoc, updateDoc } from "firebase/firestore";
import { getDownloadURL, uploadBytes } from "firebase/storage";

//mock the firebase configuration to avoid actual firebase calls during testing
jest.mock("@/config/firebaseConfig", () => ({
  auth: { currentUser: { uid: "user123" } }, //mock auth with a test user
  db: {}, //mock empty database
  storage: {}, //mock empty storage
}));

//mock the user provider hook to return a test user
jest.mock("@/config/userProvider", () => ({
  useUser: () => ({ user: { uid: "user123" }, loading: false }), //return mock user data
}));

//mock firestore functions to avoid actual database operations
jest.mock("firebase/firestore", () => ({
  doc: jest.fn(), //mock document reference creation
  getDoc: jest.fn(), //mock document retrieval
  updateDoc: jest.fn(), //mock document update
}));

//mock firebase auth functions
jest.mock("firebase/auth", () => ({
  updateProfile: jest.fn(), //mock profile update function
}));

//mock firebase storage functions
jest.mock("firebase/storage", () => ({
  ref: jest.fn(), //mock storage reference creation
  uploadBytes: jest.fn(), //mock file upload
  getDownloadURL: jest.fn(), //mock URL retrieval
}));

//test suite for the EditProfileForm component
describe("EditProfileForm", () => {
  //mock callback function for save operation
  const onSave = jest.fn();

  //beforeEach runs before each test to reset mocks and set up default behavior
  beforeEach(() => {
    jest.clearAllMocks(); //clear all mock calls and implementations

    //mock successful document retrieval with test data
    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => true, //document exists
      data: () => ({
        username: "johndoe",
        displayName: "John Doe",
        bio: "My bio",
        photoURL: "https://example.com/photo.jpg",
      }),
    });

    //mock successful URL retrieval for uploaded photos
    (getDownloadURL as jest.Mock).mockResolvedValue("https://example.com/photo.jpg");
  });

  //test that the form renders with initial data from firestore
  it("renders form with initial data", async () => {
    render(<EditProfileForm userId="user123" onSave={onSave} />);

    //wait for the form to load and populate with data
    await waitFor(() => {
      //verify username input has correct value
      expect(screen.getByDisplayValue("johndoe")).toBeInTheDocument();
      //verify display name input has correct value
      expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument();
      //verify bio textarea has correct value
      expect(screen.getByDisplayValue("My bio")).toBeInTheDocument();
      //verify profile image has correct source
      expect(screen.getByAltText("Profile")).toHaveAttribute(
        "src",
        "https://example.com/photo.jpg"
      );
    });
  });

  //test that form inputs update state correctly when changed
  it("updates state when inputs change", async () => {
    render(<EditProfileForm userId="user123" onSave={onSave} />);

    //wait for username input to load and then change its value
    const usernameInput = await screen.findByDisplayValue("johndoe");
    fireEvent.change(usernameInput, { target: { value: "newuser" } });
    //verify the input value was updated
    expect((usernameInput as HTMLInputElement).value).toBe("newuser");

    //change display name input value
    const displayNameInput = screen.getByDisplayValue("John Doe");
    fireEvent.change(displayNameInput, { target: { value: "New Name" } });
    //verify the input value was updated
    expect((displayNameInput as HTMLInputElement).value).toBe("New Name");

    //change bio textarea value
    const bioInput = screen.getByDisplayValue("My bio");
    fireEvent.change(bioInput, { target: { value: "New bio" } });
    //verify the textarea value was updated
    expect((bioInput as HTMLTextAreaElement).value).toBe("New bio");
  });

  //test that the save button triggers the correct operations
  it("calls onSave when clicking the Save button", async () => {
    render(<EditProfileForm userId="user123" onSave={onSave} />);

    //wait for initial data to load
    await screen.findByDisplayValue("johndoe");

    //find and click the save button
    const saveButton = screen.getByRole("button", { name: /save/i });
    fireEvent.click(saveButton);

    //wait for operations to complete and verify they were called
    await waitFor(() => {
      //verify firestore document was updated
      expect(updateDoc).toHaveBeenCalled();
      //verify onSave callback was called with correct data
      expect(onSave).toHaveBeenCalledWith(
        "John Doe",
        "johndoe",
        "My bio",
        "https://example.com/photo.jpg"
      );
    });
  });

  //test that photo upload functionality works correctly
  it("handles photo upload", async () => {
    render(<EditProfileForm userId="user123" onSave={onSave} />);

    //wait for initial data to load
    await screen.findByDisplayValue("johndoe");

    //create a mock file for testing upload
    const file = new File(["photo"], "photo.png", { type: "image/png" });

    //find the file input using its label (more reliable than by test id)
    const input = screen.getByLabelText(/Change photo/i) as HTMLInputElement;

    //simulate file selection
    fireEvent.change(input, { target: { files: [file] } });

    //wait for upload operations to complete and verify they were called
    await waitFor(() => {
      //verify file was uploaded to storage
      expect(uploadBytes).toHaveBeenCalled();
      //verify download URL was retrieved
      expect(getDownloadURL).toHaveBeenCalled();
      //verify user profile was updated with new photo
      expect(updateProfile).toHaveBeenCalled();
      //verify the image src was updated
      expect(screen.getByAltText("Profile")).toHaveAttribute(
        "src",
        "https://example.com/photo.jpg"
      );
    });
  });
});