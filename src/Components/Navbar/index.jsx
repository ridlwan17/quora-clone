import React, { useEffect } from "react";
import styles from "./style.module.css";
import { Box, Button, Container, Flex, Text, UnorderedList } from "@chakra-ui/react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import GroupIcon from "../Icon/Group";
import HomeIcon from "../Icon/Home";
import PenIcon from "../Icon/Pen";
import Logo from "../Logo";
import NavItem from "./NavItem";
import { useSelector, useDispatch } from "react-redux";
import userQuery from "../../GraphQL/user/query";
import { useLazyQuery } from "@apollo/client";
import LoginButton from "../LoginButton";
import ProfileButton from "../ProfileButton";
import { SET_LOGIN_FALSE } from "../../store/auth/action";

import useTokenValid from "../../hooks/useTokenValid";
import { removeAuth } from "../../auth/auth";

const Navbar = React.memo(() => {
    const navigate = useNavigate();

    const dispatch = useDispatch();

    const { pathname } = useLocation();

    const { username: usernameParams } = useParams();

    const { checkTokenValid } = useTokenValid();

    const { GET_USER_BY_USERNAME } = userQuery;

    const { isLogin, username } = useSelector((state) => state.authReducer);

    const [getUserByUsername, { data }] = useLazyQuery(GET_USER_BY_USERNAME);

    const handleLogout = () => {
        dispatch(SET_LOGIN_FALSE());
        removeAuth();
        navigate("/");
    };

    const getLocalStorage = () => {
        if (localStorage.getItem("userToken")) {
            const lStorage = JSON.parse(localStorage.getItem("userToken"));
            const { token } = lStorage;
            return token;
        } else {
            return null;
        }
    };

    useEffect(() => {
        if (username !== "") {
            console.log("kesini", username);
            getUserByUsername({
                variables: {
                    username: username,
                },
            });
        }
    }, [username]);

    useEffect(() => {
        if (getLocalStorage() !== null) {
            checkTokenValid(getLocalStorage());
        }
    }, [usernameParams]);

    return (
        <Box bgColor="white" boxShadow="0px 1px 7px rgba(0, 0, 0, 0.17)" py={2} position="sticky" top={0} zIndex={99}>
            <Container maxW={1000} display={{ base: "block", sm: "flex" }} justifyContent="space-between" margin="auto">
                <Flex alignItems="center">
                    <Link to="/">
                        <Logo />
                    </Link>
                </Flex>
                <UnorderedList display="flex" m={0} justifyContent={{ base: "space-between", sm: "flex-start" }} my={{ base: 4, sm: 0 }}>
                    <NavItem path="/" icon={<HomeIcon color={pathname === "/" ? "#2FD2DC" : "black"} />} />
                    <NavItem path="/question" icon={<PenIcon color={pathname === "/question" ? "#2FD2DC" : "black"} />} />
                    <NavItem path="/space" icon={<GroupIcon color={pathname === "/space" ? "#2FD2DC" : "black"} />} />
                </UnorderedList>
                <Box>
                    {!localStorage.getItem("userToken") && !isLogin ? <LoginButton /> : ""}
                    {isLogin && typeof data !== "undefined" && (
                        <Box className={styles.dropdown} cursor="pointer">
                            <ProfileButton profilePicture={data.users[0].profile_picture} name={data.users[0].name} username={data.users[0].username} />
                            <Box
                                className={styles.dropdownContent}
                                position="absolute"
                                bgColor="white"
                                minW={100}
                                padding={2}
                                boxShadow="0px 1px 7px rgba(0, 0, 0, 0.17)"
                                display="none"
                            >
                                <Text fontSize={14}>
                                    {/* {pathname === "/" || pathname === "/question" || pathname === "/space" ? ( */}
                                    <Link to={`/user/${data.users[0].username}/answers`} className="link-underline">
                                        Profile
                                    </Link>
                                    {/* // ) : ( //{" "}
                                    <a href={`/user/${data.users[0].username}/answers`} className="link-underline">
                                        // Profile //{" "}
                                    </a>
                                    // )} */}
                                </Text>
                                <Box h=".5px" bgColor="gray.300" />
                                <Text fontSize={14}>
                                    <span className="link-underline" onClick={() => handleLogout()}>
                                        Logout
                                    </span>
                                </Text>
                            </Box>
                        </Box>
                    )}
                </Box>
            </Container>
        </Box>
    );
});

export default Navbar;
